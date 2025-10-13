#!/usr/bin/env python3
"""
Script to check a specific training session and see what exercises were selected
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def check_specific_session():
    mongodb_uri = os.getenv("MONGODB_URI")
    if not mongodb_uri:
        print("❌ MONGODB_URI not found in environment variables")
        return
    
    client = AsyncIOMotorClient(mongodb_uri)
    db = client.mindbloom
    
    # Find rmsatapathy's session
    session = await db.training_sessions.find_one({"_id": ObjectId("68ec55057c72c08a29f3d81b")})
    
    if session:
        print("🔍 TRAINING SESSION DETAILS:")
        print(f"Session ID: {session['_id']}")
        print(f"User ID: {session['userId']}")
        print(f"Mood: {session['mood']}")
        print(f"Focus Areas: {session['focusAreas']}")
        print(f"Selected Exercises:")
        
        exercises = session.get('exercises', [])
        for i, exercise in enumerate(exercises, 1):
            print(f"  {i}. {exercise['name']} (ID: {exercise['id']})")
            print(f"     Type: {exercise['type']}")
            print(f"     Description: {exercise['description']}")
            print(f"     Difficulty: {exercise['difficulty']}")
            print()
    else:
        print("❌ Session not found")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_specific_session())