from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()

# Database dependency - will be injected from main.py
async def get_database() -> AsyncIOMotorDatabase:
    from main import db
    return db

@router.get("/check-user/{email}")
async def check_user_exists(email: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    """Check if a user exists in the database"""
    user_doc = await db.users.find_one({"email": email})
    return {"exists": user_doc is not None}