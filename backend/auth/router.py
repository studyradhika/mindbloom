from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError
from typing import Optional

from models.user import UserCreate, UserInDB, User, Token, UserLogin
from auth.security import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    verify_token,
    create_credentials_exception
)

router = APIRouter()

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

# Database dependency - will be injected from main.py
async def get_database() -> AsyncIOMotorDatabase:
    from main import db
    return db

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncIOMotorDatabase = Depends(get_database)) -> User:
    """Get the current authenticated user from JWT token"""
    credentials_exception = create_credentials_exception()
    
    email = verify_token(token)
    if email is None:
        raise credentials_exception
    
    user_doc = await db.users.find_one({"email": email})
    if user_doc is None:
        raise credentials_exception
    
    # Convert MongoDB document to User model
    user_doc["id"] = str(user_doc["_id"])
    del user_doc["_id"]
    del user_doc["hashed_password"]  # Don't include password in response
    
    return User(**user_doc)

@router.post("/signup", response_model=Token)
async def signup(user_data: UserCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    """Register a new user"""
    try:
        # Hash the password
        hashed_password = get_password_hash(user_data.password)
        
        # Create user document
        user_doc = {
            "name": user_data.name,
            "email": user_data.email,
            "hashed_password": hashed_password,
            "ageGroup": user_data.ageGroup,
            "cognitiveConditions": user_data.cognitiveConditions,
            "otherCondition": user_data.otherCondition,
            "reminderTime": user_data.reminderTime,
            "streak": 0,
            "totalSessions": 0,
            "createdAt": datetime.utcnow()
        }
        
        # Create unique index on email if it doesn't exist
        await db.users.create_index("email", unique=True)
        
        # Insert user into database
        result = await db.users.insert_one(user_doc)
        
        # Create access token
        access_token_expires = timedelta(minutes=60)  # 1 hour
        access_token = create_access_token(
            data={"sub": user_data.email}, expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
        
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncIOMotorDatabase = Depends(get_database)):
    """Authenticate user and return access token"""
    # Find user by email (username field contains email)
    user_doc = await db.users.find_one({"email": form_data.username})
    
    if not user_doc or not verify_password(form_data.password, user_doc["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=60)  # 1 hour
    access_token = create_access_token(
        data={"sub": user_doc["email"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user