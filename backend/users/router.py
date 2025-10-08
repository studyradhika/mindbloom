from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.user import User
from auth.router import get_current_user

router = APIRouter()

@router.get("/me", response_model=User)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get the current user's profile"""
    return current_user