from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timedelta
from typing import List, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase

from auth.router import get_current_user
from models.user import User
from models.progress import ProgressSummary
from progress.logic import get_progress_analytics, get_cached_progress_or_calculate

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

@router.get("/quick")
async def get_quick_progress_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get quick progress summary using cached data when available"""
    try:
        cached_progress = await get_cached_progress_or_calculate(current_user.id, db)
        return cached_progress
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch quick progress data: {str(e)}")

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
        
        # Find today's training sessions (completed or with exercise data)
        cursor = db.training_sessions.find({
            "userId": current_user.id,
            "createdAt": {
                "$gte": start_of_day,
                "$lte": end_of_day
            }
        }).sort("createdAt", 1)
        
        sessions = []
        async for session in cursor:
            # Include sessions that are either complete OR have exercise results
            if session.get("isComplete", False) or session.get("exerciseResults", []):
                sessions.append(session)
        
        if not sessions:
            return {
                "hasData": False,
                "message": "No training sessions completed today"
            }
        
        # Aggregate today's session data
        total_exercises = 0
        focus_area_exercises = {}
        all_exercise_scores = []
        total_time = 0
        mood = None
        
        for session in sessions:
            # Get session details
            if not mood and session.get("mood"):
                mood = session["mood"]
            
            # Get the focus areas that were selected for this session
            session_focus_areas = session.get("focusAreas", ["general"])
            exercise_results = session.get("exerciseResults", [])
            
            # Skip sessions with no exercise results
            if not exercise_results:
                continue
            
            # Distribute exercises across the selected focus areas
            exercises_per_area = len(exercise_results) // len(session_focus_areas) if session_focus_areas else len(exercise_results)
            
            for i, result in enumerate(exercise_results):
                total_exercises += 1
                total_time += result.get("timeSpent", 0)
                
                # Get the exercise score and normalize it to percentage with robust None handling
                raw_score = result.get("score", 0)
                
                # Robust score handling
                if raw_score is None:
                    exercise_score = 0.0
                elif isinstance(raw_score, str):
                    try:
                        exercise_score = float(raw_score)
                    except (ValueError, TypeError):
                        exercise_score = 0.0
                elif isinstance(raw_score, (int, float)):
                    # Check for NaN
                    if isinstance(raw_score, float) and (raw_score != raw_score):
                        exercise_score = 0.0
                    else:
                        exercise_score = float(raw_score)
                        # Handle both percentage (0-100) and decimal (0-1) formats
                        if exercise_score <= 1.0:
                            exercise_score = exercise_score * 100
                else:
                    exercise_score = 0.0
                
                all_exercise_scores.append(exercise_score)
                
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
                    "score": exercise_score,
                    "timeSpent": result.get("timeSpent", 0)
                })
                focus_area_exercises[focus_area]["total_score"] += exercise_score
                focus_area_exercises[focus_area]["count"] += 1
        
        # Calculate overall average from all exercise scores
        average_session_score = sum(all_exercise_scores) / len(all_exercise_scores) if all_exercise_scores else 0
        
        # Format focus area data with robust division handling
        areas = {}
        for focus_area, data in focus_area_exercises.items():
            # Robust division to prevent NoneType errors
            try:
                if data["count"] > 0 and data["total_score"] is not None:
                    average_score = data["total_score"] / data["count"]
                else:
                    average_score = 0.0
            except (TypeError, ZeroDivisionError):
                average_score = 0.0
            
            areas[focus_area] = {
                "scores": [ex["score"] for ex in data["exercises"] if ex["score"] is not None],
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