from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MemoryNoteCreate(BaseModel):
    """Model for creating a new memory note"""
    title: str
    content: str

class MemoryNoteUpdate(BaseModel):
    """Model for updating a memory note"""
    title: Optional[str] = None
    content: Optional[str] = None

class MemoryNoteInDB(BaseModel):
    """Model for memory note as stored in database"""
    id: str
    userId: str
    title: str
    content: str
    createdAt: datetime
    updatedAt: datetime

class MemoryNote(BaseModel):
    """Model for memory note response"""
    id: str
    userId: str
    title: str
    content: str
    createdAt: datetime
    updatedAt: datetime