from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PerformanceTrend(BaseModel):
    """Model for a single data point in a time-series chart"""
    date: datetime
    score: float

class FocusAreaAnalytics(BaseModel):
    """Model to hold analytics for a specific cognitive area"""
    area_name: str
    current_score: float
    improvement_status: str  # "improving", "stable", "declining"
    sessions_count: int
    average_score: float
    best_score: float
    trend_data: List[PerformanceTrend]

class ProgressSummary(BaseModel):
    """Main model that will be returned by the API"""
    user_id: str
    total_sessions: int
    current_streak: int
    overall_average_score: float
    best_session_score: float
    total_time_spent: int  # in seconds
    focus_areas_analytics: List[FocusAreaAnalytics]
    recent_performance_trend: List[PerformanceTrend]
    improvement_areas: List[str]
    strengths: List[str]
    generated_at: datetime