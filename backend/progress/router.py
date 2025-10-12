from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timedelta
from typing import List, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase

from auth.router import get_current_user
from models.user import User
from models.progress import ProgressSummary
from progress.logic import get_progress_analytics

router = APIRouter()

# Database dependency - will be injected from main.py
async def get_database() -> AsyncIOMotorDatabase:
    from main import db
    return db

@router.get("/", response_model=ProgressSummary)
async def get_progress_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get comprehensive progress analytics for the current user"""
    try:
        progress_summary = await get_progress_analytics(current_user.id, db)
        return progress_summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch progress data: {str(e)}")

@router.get("/today")
async def get_todays_performance(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get today's specific training session performance"""
    try:
        # Get today's date range
        today = datetime.utcnow().date()
        start_of_day = datetime.combine(today, datetime.min.time())
        end_of_day = datetime.combine(today, datetime.max.time())
        
        # Find today's completed training sessions
        cursor = db.training_sessions.find({
            "userId": current_user.id,
            "isComplete": True,
            "createdAt": {
                "$gte": start_of_day,
                "$lte": end_of_day
            }
        }).sort("createdAt", 1)
        
        sessions = []
        async for session in cursor:
            sessions.append(session)
        
        if not sessions:
            return {
                "hasData": False,
                "message": "No training sessions completed today"
            }
        
        # Aggregate today's session data
        total_exercises = 0
        focus_area_exercises = {}
        total_score = 0
        total_time = 0
        mood = None
        
        for session in sessions:
            # Get session details
            if not mood and session.get("mood"):
                mood = session["mood"]
            
            # Get the focus areas that were selected for this session
            session_focus_areas = session.get("focusAreas", ["general"])
            exercise_results = session.get("exerciseResults", [])
            session_score = session.get("averageScore", 0)
            
            # Distribute exercises across the selected focus areas
            exercises_per_area = len(exercise_results) // len(session_focus_areas) if session_focus_areas else len(exercise_results)
            
            for i, result in enumerate(exercise_results):
                total_exercises += 1
                total_time += result.get("timeSpent", 0)
                
                # Assign exercise to focus area based on session's selected focus areas
                # Distribute exercises evenly across selected focus areas
                focus_area_index = i // max(1, exercises_per_area) if exercises_per_area > 0 else 0
                focus_area_index = min(focus_area_index, len(session_focus_areas) - 1)
                focus_area = session_focus_areas[focus_area_index]
                
                if focus_area not in focus_area_exercises:
                    focus_area_exercises[focus_area] = {
                        "exercises": [],
                        "total_score": 0,
                        "count": 0
                    }
                
                focus_area_exercises[focus_area]["exercises"].append({
                    "type": result.get("exerciseType", "unknown"),
                    "score": result.get("score", 0),
                    "timeSpent": result.get("timeSpent", 0)
                })
                focus_area_exercises[focus_area]["total_score"] += result.get("score", 0)
                focus_area_exercises[focus_area]["count"] += 1
            
            total_score += session_score
        
        # Calculate averages
        average_session_score = total_score / len(sessions) if sessions else 0
        
        # Format focus area data
        areas = {}
        for focus_area, data in focus_area_exercises.items():
            average_score = data["total_score"] / data["count"] if data["count"] > 0 else 0
            areas[focus_area] = {
                "scores": [ex["score"] for ex in data["exercises"]],
                "average": round(average_score),
                "count": data["count"]
            }
        
        return {
            "hasData": True,
            "areas": areas,
            "totalExercises": total_exercises,
            "completedExercises": total_exercises,
            "averageScore": round(average_session_score),
            "duration": round(total_time / 60),  # Convert to minutes
            "mood": mood or "focused",
            "sessionsCount": len(sessions)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch today's performance: {str(e)}")

def _map_exercise_to_focus_area(exercise_type: str) -> str:
    """Map exercise type to focus area"""
    exercise_mapping = {
        # Attention exercises
        "blue_dots": "attention",
        "attention_focus": "attention",
        "selective_attention": "attention",
        
        # Memory exercises
        "word_recall": "memory",
        "number_sequence": "memory",
        "visual_memory": "memory",
        
        # Language exercises
        "word_association": "language",
        "sentence_completion": "language",
        "vocabulary": "language",
        
        # Executive function exercises
        "task_switching": "executive",
        "working_memory": "executive",
        "cognitive_flexibility": "executive",
        
        # Processing speed exercises
        "reaction_time": "processing",
        "speed_matching": "processing",
        "rapid_naming": "processing",
        
        # Spatial reasoning exercises
        "mental_rotation": "spatial",
        "spatial_memory": "spatial",
        "pattern_recognition": "spatial",
        
        # Creativity exercises
        "creative_thinking": "creativity",
        "divergent_thinking": "creativity",
        "idea_generation": "creativity",
        
        # General cognitive exercises
        "mindful_breathing": "general",
        "cognitive_warm_up": "general",
        "mental_flexibility": "general",
        
        # Perception exercises
        "visual_perception": "perception",
        "spatial_awareness": "perception",
        "object_recognition": "perception"
    }
    
    return exercise_mapping.get(exercise_type, "general")