from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from bson import ObjectId

from models.training import (
    TrainingSessionCreate, 
    TrainingSessionComplete, 
    TrainingSession,
    ExerciseResult
)
from models.user import User
from auth.router import get_current_user, get_database
from training.logic import select_exercises

router = APIRouter()

@router.post("/session", response_model=dict)
async def start_training_session(
    session_data: TrainingSessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Start a new training session for the authenticated user.
    Returns session ID and selected exercises.
    """
    try:
        # Select exercises based on focus areas and mood
        selected_exercises = select_exercises(session_data.focusAreas, session_data.mood)
        
        # Create training session document
        session_doc = {
            "userId": current_user.id,
            "mood": session_data.mood,
            "focusAreas": session_data.focusAreas,
            "exercises": selected_exercises,
            "exerciseResults": None,
            "averageScore": None,
            "isComplete": False,
            "createdAt": datetime.utcnow(),
            "completedAt": None
        }
        
        # Insert session into database
        result = await db.training_sessions.insert_one(session_doc)
        session_id = str(result.inserted_id)
        
        return {
            "sessionId": session_id,
            "exercises": selected_exercises,
            "message": "Training session started successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start training session: {str(e)}"
        )

@router.post("/session/{session_id}/complete", response_model=dict)
async def complete_training_session(
    session_id: str,
    completion_data: TrainingSessionComplete,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Complete a training session by submitting exercise results.
    Updates session data and user statistics.
    """
    try:
        # Validate session ID format
        if not ObjectId.is_valid(session_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid session ID format"
            )
        
        # Find the training session
        session_doc = await db.training_sessions.find_one({
            "_id": ObjectId(session_id),
            "userId": current_user.id
        })
        
        if not session_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Training session not found"
            )
        
        if session_doc.get("isComplete", False):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Training session already completed"
            )
        
        # Calculate average score
        scores = [result.score for result in completion_data.exerciseResults]
        average_score = sum(scores) / len(scores) if scores else 0.0
        
        # Convert ExerciseResult objects to dictionaries for MongoDB storage
        exercise_results_dict = [
            {
                "exerciseId": result.exerciseId,
                "score": result.score,
                "timeSpent": result.timeSpent
            }
            for result in completion_data.exerciseResults
        ]
        
        # Update training session
        await db.training_sessions.update_one(
            {"_id": ObjectId(session_id)},
            {
                "$set": {
                    "exerciseResults": exercise_results_dict,
                    "averageScore": average_score,
                    "isComplete": True,
                    "completedAt": datetime.utcnow()
                }
            }
        )
        
        # Update user statistics
        # Get current user data
        user_doc = await db.users.find_one({"_id": ObjectId(current_user.id)})
        if not user_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Calculate new streak and total sessions
        current_streak = user_doc.get("streak", 0)
        total_sessions = user_doc.get("totalSessions", 0)
        
        # For simplicity, increment streak by 1 (in a real app, you'd check if it's consecutive days)
        new_streak = current_streak + 1
        new_total_sessions = total_sessions + 1
        
        # Update user document
        await db.users.update_one(
            {"_id": ObjectId(current_user.id)},
            {
                "$set": {
                    "streak": new_streak,
                    "totalSessions": new_total_sessions
                }
            }
        )
        
        return {
            "message": "Training session completed successfully",
            "averageScore": average_score,
            "newStreak": new_streak,
            "totalSessions": new_total_sessions
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete training session: {str(e)}"
        )

@router.get("/sessions", response_model=List[TrainingSession])
async def get_user_training_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    limit: int = 10,
    skip: int = 0
):
    """
    Get training sessions for the authenticated user.
    """
    try:
        # Find user's training sessions
        cursor = db.training_sessions.find(
            {"userId": current_user.id}
        ).sort("createdAt", -1).skip(skip).limit(limit)
        
        sessions = []
        async for session_doc in cursor:
            # Convert MongoDB document to TrainingSession model
            session_doc["id"] = str(session_doc["_id"])
            del session_doc["_id"]
            
            # Convert exercise results back to ExerciseResult objects if they exist
            if session_doc.get("exerciseResults"):
                session_doc["exerciseResults"] = [
                    ExerciseResult(**result) for result in session_doc["exerciseResults"]
                ]
            
            sessions.append(TrainingSession(**session_doc))
        
        return sessions
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve training sessions: {str(e)}"
        )