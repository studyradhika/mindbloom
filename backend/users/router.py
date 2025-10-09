from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, Any

from models.user import User, UserUpdate
from auth.router import get_current_user

router = APIRouter()

# Database dependency - will be injected from main.py
async def get_database() -> AsyncIOMotorDatabase:
    from main import db
    return db

@router.get("/me", response_model=User)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get the current user's profile"""
    return current_user

@router.put("/me", response_model=User)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update the current user's profile settings (email is not updatable)"""
    try:
        # Build update document with only provided fields
        update_doc: Dict[str, Any] = {}
        
        if user_update.name is not None:
            update_doc["name"] = user_update.name
        if user_update.ageGroup is not None:
            update_doc["ageGroup"] = user_update.ageGroup
        if user_update.cognitiveConditions is not None:
            update_doc["cognitiveConditions"] = user_update.cognitiveConditions
        if user_update.otherCondition is not None:
            update_doc["otherCondition"] = user_update.otherCondition
        if user_update.reminderTime is not None:
            update_doc["reminderTime"] = user_update.reminderTime
        if user_update.timePreference is not None:
            update_doc["timePreference"] = user_update.timePreference
        if user_update.goals is not None:
            update_doc["goals"] = user_update.goals
        if user_update.cognitiveAreas is not None:
            update_doc["cognitiveAreas"] = user_update.cognitiveAreas
        
        # If no fields to update, return current user
        if not update_doc:
            return current_user
        
        # Update user in database
        result = await db.users.update_one(
            {"email": current_user.email},
            {"$set": update_doc}
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Fetch and return updated user
        updated_user_doc = await db.users.find_one({"email": current_user.email})
        if not updated_user_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found after update"
            )
        
        # Convert MongoDB document to User model
        updated_user_doc["id"] = str(updated_user_doc["_id"])
        del updated_user_doc["_id"]
        del updated_user_doc["hashed_password"]  # Don't include password in response
        
        return User(**updated_user_doc)
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user profile"
        )