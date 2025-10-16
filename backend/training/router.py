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
from progress.logic import recalculate_user_progress

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
        # Get areas yet to practice (priority areas) from session data if provided
        priority_areas = getattr(session_data, 'priorityAreas', None)
        
        # For new sessions, session duration is 0
        session_duration_minutes = 0.0
        
        print("Session Data:",session_data)

        # Select exercises based on focus areas and mood, prioritizing areas yet to practice
        selected_exercises = select_exercises(  
            session_data.focusAreas,
            session_data.mood,
            priority_areas,
            session_duration_minutes
        )

        print("Selected Exercises:", selected_exercises)
        
        # Create training session document
        session_doc = {
            "userId": current_user.id,
            "mood": session_data.mood,
            "focusAreas": session_data.focusAreas,
            "exercises": selected_exercises,
            "exerciseResults": [],  # Initialize as empty array instead of None
            "averageScore": None,
            "isComplete": False,
            "createdAt": datetime.utcnow(),
            "completedAt": None
        }
        
        print("Session Doc: ", session_doc)
        
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

@router.post("/session/{session_id}/exercise", response_model=dict)
async def save_exercise_result(
    session_id: str,
    exercise_result: ExerciseResult,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Save individual exercise result to the training session.
    Called immediately when user completes an exercise and moves to the next.
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
                detail="Cannot add exercise result to completed session"
            )
        
        # Convert ExerciseResult to dictionary for MongoDB storage
        exercise_result_dict = {
            "exerciseId": exercise_result.exerciseId,
            "score": exercise_result.score,
            "timeSpent": exercise_result.timeSpent,
            "completedAt": datetime.utcnow()
        }
        
        # Add the exercise result to the session
        await db.training_sessions.update_one(
            {"_id": ObjectId(session_id)},
            {
                "$push": {"exerciseResults": exercise_result_dict}
            }
        )
        
        # Get updated session to calculate current progress
        updated_session = await db.training_sessions.find_one({"_id": ObjectId(session_id)})
        exercise_results = updated_session.get("exerciseResults", [])
        
        # Calculate completed areas based on exercise results
        completed_areas = []
        remaining_areas = list(session_doc.get("focusAreas", []))
        
        # Map exercise IDs to focus areas (simplified mapping)
        exercise_to_area_map = {
            "speed_processing": "processing",
            "pattern_recognition": "processing",
            "memory_sequence": "memory",
            "word_pairs": "memory",
            "visual_recall": "memory",
            "focused_attention": "attention",
            "divided_attention": "attention",
            "sustained_attention": "attention",
            "word_finding": "language",
            "sentence_completion": "language",
            "verbal_fluency": "language",
            "planning_task": "executive",
            "cognitive_flexibility": "executive",
            "inhibition_control": "executive",
            "alternative_uses": "creativity",
            "story_building": "creativity",
            "visual_metaphors": "creativity",
            "pattern_breaking": "creativity",
            "musical_creativity": "creativity",
            "perspective_shift": "creativity",
            "3d_rotation": "spatial",
            "mental_folding": "spatial",
            "spatial_navigation": "spatial",
            "block_design": "spatial",
            "perspective_taking": "spatial",
            "cognitive_warm_up": "general",
            "mental_flexibility": "general",
            "mindful_breathing": "general",
            "object_recognition": "perception",
            "spatial_awareness": "perception",
            "visual_perception": "perception"
        }
        print("Exercise Results:",exercise_results)
        # Determine completed areas from exercise results
        for result in exercise_results:
            print("Result:",result)
            exercise_id = result.get("exerciseId")
            area = exercise_to_area_map.get(exercise_id)

            print("Area:",area)

            if area and area in remaining_areas:
                completed_areas.append(area)
                remaining_areas.remove(area)

        print("Completed Areas:", completed_areas)
        print("Remaining Areas", remaining_areas)

        # Calculate current average score
        scores = [result.get("score", 0) for result in exercise_results if result.get("score") is not None]
        current_average = sum(scores) / len(scores) if scores else 0.0
        
        # Recalculate user progress immediately after each exercise
        try:
            updated_progress = await recalculate_user_progress(current_user.id, db)
            print(f"Progress recalculated for user {current_user.id} after exercise completion")
        except Exception as progress_error:
            print(f"Warning: Failed to recalculate progress for user {current_user.id}: {str(progress_error)}")
        
        return {
            "message": "Exercise result saved successfully",
            "completedAreas": completed_areas,
            "remainingAreas": remaining_areas,
            "currentAverage": current_average,
            "totalExercisesCompleted": len(exercise_results)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save exercise result: {str(e)}"
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
        
        # Get existing exercise results from the session
        existing_results = session_doc.get("exerciseResults", [])
        
        # Add any new exercise results from completion_data that aren't already saved
        existing_exercise_ids = {result.get("exerciseId") for result in existing_results}
        
        for result in completion_data.exerciseResults:
            if result.exerciseId not in existing_exercise_ids:
                exercise_result_dict = {
                    "exerciseId": result.exerciseId,
                    "score": result.score,
                    "timeSpent": result.timeSpent,
                    "completedAt": datetime.utcnow()
                }
                existing_results.append(exercise_result_dict)
        
        # Calculate average score from all results
        scores = [result.get("score", 0) for result in existing_results if result.get("score") is not None]
        average_score = sum(scores) / len(scores) if scores else 0.0
        
        # Update training session as complete
        await db.training_sessions.update_one(
            {"_id": ObjectId(session_id)},
            {
                "$set": {
                    "exerciseResults": existing_results,
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
        
        # Recalculate user progress immediately after session completion
        try:
            updated_progress = await recalculate_user_progress(current_user.id, db)
            print(f"Progress recalculated for user {current_user.id}: {updated_progress}")
        except Exception as progress_error:
            # Don't fail the session completion if progress calculation fails
            print(f"Warning: Failed to recalculate progress for user {current_user.id}: {str(progress_error)}")
        
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