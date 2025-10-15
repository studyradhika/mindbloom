from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ExerciseResult(BaseModel):
    """Model for capturing the result of a single exercise"""
    exerciseId: str
    score: float
    timeSpent: int  # in seconds

class TrainingSessionCreate(BaseModel):
    """Model for the request body when starting a training session"""
    mood: str
    focusAreas: List[str]
    priorityAreas: Optional[List[str]] = None  # Areas yet to practice (skipped or incomplete)

class TrainingSessionInDB(BaseModel):
    """Model for training session data stored in MongoDB"""
    id: str
    userId: str
    mood: str
    focusAreas: List[str]
    exercises: List[dict]
    exerciseResults: Optional[List[ExerciseResult]] = None
    averageScore: Optional[float] = None
    isComplete: bool = False
    createdAt: datetime
    completedAt: Optional[datetime] = None

class TrainingSessionComplete(BaseModel):
    """Model for the request body when completing a training session"""
    exerciseResults: List[ExerciseResult]

class TrainingSession(BaseModel):
    """Model for training session response (without sensitive data)"""
    id: str
    userId: str
    mood: str
    focusAreas: List[str]
    exercises: List[dict]
    exerciseResults: Optional[List[ExerciseResult]] = None
    averageScore: Optional[float] = None
    isComplete: bool = False
    createdAt: datetime
    completedAt: Optional[datetime] = None