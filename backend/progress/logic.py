from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from motor.motor_asyncio import AsyncIOMotorDatabase
from collections import defaultdict
import statistics

from models.progress import ProgressSummary, FocusAreaAnalytics, PerformanceTrend

async def get_progress_analytics(user_id: str, db: AsyncIOMotorDatabase) -> ProgressSummary:
    """
    Fetch all training sessions for the given user_id from MongoDB and
    aggregate the data to calculate performance trends and analytics.
    
    Args:
        user_id: The ID of the user to get analytics for
        db: MongoDB database connection
        
    Returns:
        ProgressSummary: Compiled analytics data
    """
    
    # Fetch all completed training sessions for the user
    cursor = db.training_sessions.find({
        "userId": user_id,
        "isComplete": True
    }).sort("createdAt", 1)  # Sort by creation date ascending
    
    sessions = []
    async for session in cursor:
        sessions.append(session)
    
    if not sessions:
        # Return empty analytics if no sessions found
        return ProgressSummary(
            user_id=user_id,
            total_sessions=0,
            current_streak=0,
            overall_average_score=0.0,
            best_session_score=0.0,
            total_time_spent=0,
            focus_areas_analytics=[],
            recent_performance_trend=[],
            improvement_areas=[],
            strengths=[],
            generated_at=datetime.utcnow()
        )
    
    # Calculate basic statistics
    total_sessions = len(sessions)
    all_scores = [session.get("averageScore", 0.0) for session in sessions if session.get("averageScore") is not None]
    overall_average_score = statistics.mean(all_scores) if all_scores else 0.0
    best_session_score = max(all_scores) if all_scores else 0.0
    
    # Calculate total time spent
    total_time_spent = 0
    for session in sessions:
        if session.get("exerciseResults"):
            for result in session["exerciseResults"]:
                total_time_spent += result.get("timeSpent", 0)
    
    # Get current streak from user document
    user_doc = await db.users.find_one({"_id": user_id})
    current_streak = user_doc.get("streak", 0) if user_doc else 0
    
    # Calculate focus area analytics
    focus_areas_analytics = await _calculate_focus_area_analytics(sessions, db)
    
    # Calculate recent performance trend (last 30 days)
    recent_performance_trend = _calculate_performance_trend(sessions, days=30)
    
    # Determine improvement areas and strengths
    improvement_areas, strengths = _analyze_performance_patterns(focus_areas_analytics)
    
    return ProgressSummary(
        user_id=user_id,
        total_sessions=total_sessions,
        current_streak=current_streak,
        overall_average_score=overall_average_score,
        best_session_score=best_session_score,
        total_time_spent=total_time_spent,
        focus_areas_analytics=focus_areas_analytics,
        recent_performance_trend=recent_performance_trend,
        improvement_areas=improvement_areas,
        strengths=strengths,
        generated_at=datetime.utcnow()
    )

async def _calculate_focus_area_analytics(sessions: List[Dict[str, Any]], db: AsyncIOMotorDatabase) -> List[FocusAreaAnalytics]:
    """Calculate analytics for each focus area"""
    
    # Exercise to focus area mapping
    exercise_to_area_map = {
        # Memory exercises
        'memory_sequence': 'memory',
        'word_pairs': 'memory',
        'visual_recall': 'memory',
        'working_memory': 'memory',
        # Attention exercises
        'attention': 'attention',  # Blue circle attention exercise
        'divided_attention': 'attention',
        'sustained_attention': 'attention',
        'selective_attention': 'attention',
        # Perception exercises
        'focused_attention': 'perception',
        'pattern_recognition': 'perception',
        'visual_perception': 'perception',
        # Language exercises
        'word_finding': 'language',
        'sentence_completion': 'language',
        'verbal_fluency': 'language',
        'reading_comprehension': 'language',
        # Executive exercises
        'planning_task': 'executive',
        'cognitive_flexibility': 'executive',
        'inhibition_control': 'executive',
        'task_switching': 'executive',
        # Processing Speed exercises
        'speed_processing': 'processing',
        'rapid_naming': 'processing',
        'symbol_coding': 'processing',
        # Spatial Reasoning exercises
        'spatial_rotation': 'spatial',
        'mental_rotation': 'spatial',
        'spatial_navigation': 'spatial',
        'block_design': 'spatial',
        # Creativity exercises
        'creative_thinking': 'creativity',
        'divergent_thinking': 'creativity',
        'idea_generation': 'creativity',
        'creative_problem_solving': 'creativity',
        'alternative_uses': 'creativity',
        'musical_creativity': 'creativity',
        'story_creation': 'creativity',
        # General Cognitive exercises
        'general_cognitive': 'general',
        'cognitive_assessment': 'general',
        'brain_training': 'general',
        'mindful_breathing': 'general',
        'cognitive_warm_up': 'general',
        'mental_flexibility': 'general'
    }
    
    # Group exercise results by focus areas
    focus_area_data = defaultdict(list)
    
    for session in sessions:
        session_date = session.get("createdAt")
        exercise_results = session.get("exerciseResults", [])
        
        if not exercise_results:
            # Fallback to session average if no individual results
            focus_areas = session.get("focusAreas", [])
            session_score = session.get("averageScore", 0.0)
            for area in focus_areas:
                focus_area_data[area].append({
                    "score": session_score,
                    "date": session_date
                })
            continue
        
        # Calculate scores per focus area based on exercises
        area_scores = defaultdict(list)
        
        for result in exercise_results:
            exercise_id = result.get("exerciseId", "")
            exercise_score = result.get("score", 0.0)
            
            # Map exercise to focus area
            focus_area = exercise_to_area_map.get(exercise_id)
            if focus_area:
                area_scores[focus_area].append(exercise_score)
        
        # Calculate average score for each focus area in this session
        for area, scores in area_scores.items():
            if scores:
                area_average = sum(scores) / len(scores)
                focus_area_data[area].append({
                    "score": area_average,
                    "date": session_date
                })
    
    analytics = []
    
    for area_name, area_sessions in focus_area_data.items():
        if not area_sessions:
            continue
            
        scores = [s["score"] for s in area_sessions]
        sessions_count = len(area_sessions)
        average_score = statistics.mean(scores)
        best_score = max(scores)
        current_score = area_sessions[-1]["score"]  # Most recent score
        
        # Calculate improvement status
        if sessions_count >= 3:
            recent_scores = scores[-3:]  # Last 3 sessions
            earlier_scores = scores[:-3] if len(scores) > 3 else scores[:1]
            
            recent_avg = statistics.mean(recent_scores)
            earlier_avg = statistics.mean(earlier_scores)
            
            if recent_avg > earlier_avg + 0.1:  # 10% improvement threshold
                improvement_status = "improving"
            elif recent_avg < earlier_avg - 0.1:  # 10% decline threshold
                improvement_status = "declining"
            else:
                improvement_status = "stable"
        else:
            improvement_status = "stable"
        
        # Create trend data (last 10 sessions for this area)
        trend_data = []
        recent_area_sessions = area_sessions[-10:]  # Last 10 sessions
        for session_data in recent_area_sessions:
            trend_data.append(PerformanceTrend(
                date=session_data["date"],
                score=session_data["score"]
            ))
        
        analytics.append(FocusAreaAnalytics(
            area_name=area_name,
            current_score=current_score,
            improvement_status=improvement_status,
            sessions_count=sessions_count,
            average_score=average_score,
            best_score=best_score,
            trend_data=trend_data
        ))
    
    return analytics

def _calculate_performance_trend(sessions: List[Dict[str, Any]], days: int = 30) -> List[PerformanceTrend]:
    """Calculate performance trend over the specified number of days"""
    
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    recent_sessions = [
        session for session in sessions
        if session.get("createdAt") and session["createdAt"] >= cutoff_date
    ]
    
    if not recent_sessions:
        return []
    
    # Group sessions by date and calculate daily averages and activity counts
    daily_data = defaultdict(lambda: {"scores": [], "activities": 0})
    
    for session in recent_sessions:
        session_date = session["createdAt"].date()
        session_score = session.get("averageScore", 0.0)
        exercise_count = len(session.get("exerciseResults", []))
        
        daily_data[session_date]["scores"].append(session_score)
        daily_data[session_date]["activities"] += exercise_count
    
    # Calculate daily averages and create trend data
    trend_data = []
    for date, data in sorted(daily_data.items()):
        daily_average = statistics.mean(data["scores"]) if data["scores"] else 0.0
        trend_data.append(PerformanceTrend(
            date=datetime.combine(date, datetime.min.time()),
            score=daily_average,
            activities=data["activities"]
        ))
    
    return trend_data

def _analyze_performance_patterns(focus_areas_analytics: List[FocusAreaAnalytics]) -> Tuple[List[str], List[str]]:
    """Analyze performance patterns to identify improvement areas and strengths"""
    
    improvement_areas = []
    strengths = []
    
    for analytics in focus_areas_analytics:
        # Normalize scores to handle both percentage (0-100) and decimal (0.0-1.0) formats
        # If score is > 1.0, assume it's a percentage and convert to decimal
        current_score = analytics.current_score / 100.0 if analytics.current_score > 1.0 else analytics.current_score
        average_score = analytics.average_score / 100.0 if analytics.average_score > 1.0 else analytics.average_score
        
        # Prioritize high performance - if current or average score is high, it's a strength
        is_high_performer = (current_score >= 0.8 or average_score >= 0.75)
        is_excellent_performer = (current_score >= 0.95 or average_score >= 0.9)
        
        # Excellent performers (95%+ scores) are always strengths, regardless of trend
        if is_excellent_performer:
            strengths.append(analytics.area_name)
        # High performers are strengths unless clearly declining with low recent scores
        elif is_high_performer:
            # Only consider it an improvement area if it's declining AND recent score is below 70%
            if analytics.improvement_status == "declining" and current_score < 0.7:
                improvement_areas.append(analytics.area_name)
            else:
                strengths.append(analytics.area_name)
        # Low performers need improvement
        elif (analytics.improvement_status == "declining" or
              current_score < 0.6 or  # Below 60% threshold
              average_score < 0.65):  # Below 65% average threshold
            improvement_areas.append(analytics.area_name)
        # Areas that are improving from low scores
        elif analytics.improvement_status == "improving":
            strengths.append(analytics.area_name)
    
    return improvement_areas, strengths

async def recalculate_user_progress(user_id: str, db: AsyncIOMotorDatabase) -> Dict[str, Any]:
    """
    Recalculate user progress immediately after session completion and cache the results
    
    Args:
        user_id: The ID of the user to recalculate progress for
        db: MongoDB database connection
        
    Returns:
        Dict containing updated improvement_areas and strengths
    """
    try:
        # Get fresh progress analytics
        progress_summary = await get_progress_analytics(user_id, db)
        
        # Extract the key data we need for frontend
        progress_data = {
            "improvement_areas": progress_summary.improvement_areas,
            "strengths": progress_summary.strengths,
            "last_updated": datetime.utcnow(),
            "total_sessions": progress_summary.total_sessions,
            "overall_average_score": progress_summary.overall_average_score
        }
        
        # Cache this data in the user document for quick access
        await db.users.update_one(
            {"_id": user_id},
            {
                "$set": {
                    "cached_progress": progress_data
                }
            }
        )
        
        return progress_data
        
    except Exception as e:
        print(f"Error recalculating user progress: {str(e)}")
        # Return empty data on error
        return {
            "improvement_areas": [],
            "strengths": [],
            "last_updated": datetime.utcnow(),
            "total_sessions": 0,
            "overall_average_score": 0.0
        }

async def get_cached_progress_or_calculate(user_id: str, db: AsyncIOMotorDatabase) -> Dict[str, Any]:
    """
    Get cached progress data if available and recent, otherwise recalculate
    
    Args:
        user_id: The ID of the user
        db: MongoDB database connection
        
    Returns:
        Dict containing improvement_areas and strengths
    """
    try:
        # Get user document with cached progress
        user_doc = await db.users.find_one({"_id": user_id})
        
        if user_doc and "cached_progress" in user_doc:
            cached_data = user_doc["cached_progress"]
            last_updated = cached_data.get("last_updated")
            
            # Check if cache is recent (within last hour)
            if last_updated and (datetime.utcnow() - last_updated).total_seconds() < 3600:
                return cached_data
        
        # Cache is stale or doesn't exist, recalculate
        return await recalculate_user_progress(user_id, db)
        
    except Exception as e:
        print(f"Error getting cached progress: {str(e)}")
        # Fallback to fresh calculation
        progress_summary = await get_progress_analytics(user_id, db)
        return {
            "improvement_areas": progress_summary.improvement_areas,
            "strengths": progress_summary.strengths,
            "last_updated": datetime.utcnow(),
            "total_sessions": progress_summary.total_sessions,
            "overall_average_score": progress_summary.overall_average_score
        }