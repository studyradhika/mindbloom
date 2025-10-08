from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserCreate(BaseModel):
    """Model for user creation (signup)"""
    name: str
    email: EmailStr
    password: str
    ageGroup: str
    cognitiveConditions: List[str] = []
    otherCondition: Optional[str] = None
    reminderTime: str

class UserInDB(BaseModel):
    """Model for user as stored in database"""
    id: str
    name: str
    email: EmailStr
    hashed_password: str
    ageGroup: str
    cognitiveConditions: List[str] = []
    otherCondition: Optional[str] = None
    reminderTime: str
    streak: int = 0
    totalSessions: int = 0
    createdAt: datetime

class User(BaseModel):
    """Model for user response (without sensitive data)"""
    id: str
    name: str
    email: EmailStr
    ageGroup: str
    cognitiveConditions: List[str] = []
    otherCondition: Optional[str] = None
    reminderTime: str
    streak: int = 0
    totalSessions: int = 0
    createdAt: datetime

class Token(BaseModel):
    """Model for JWT token response"""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Model for token data"""
    email: Optional[str] = None

class UserLogin(BaseModel):
    """Model for user login"""
    username: str  # This will be the email
    password: str