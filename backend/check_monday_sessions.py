#!/usr/bin/env python3

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def check_monday_sessions():
    """Check training sessions for monday user"""
    
    # Connect to MongoDB
    mongodb_uri = os.getenv("MONGODB_URI")
    if not mongodb_uri:
        print("❌ MONGODB_URI not found in environment variables")
        return
    
    client = AsyncIOMotorClient(mongodb_uri)
    db = client.mindbloom
    
    try:
        # Find monday user
        monday_user = await db.users.find_one({"email": "monday@example.com"})
        if not monday_user:
            print("❌ Monday user not found")
            return
        
        user_id = str(monday_user["_id"])
        print(f"✅ Found monday user with ID: {user_id}")
        
        # Get all training sessions for monday
        sessions_cursor = db.training_sessions.find({"userId": user_id}).sort("createdAt", -1)
        sessions = []
        async for session in sessions_cursor:
            sessions.append(session)
        
        print(f"\n📊 Total training sessions for monday: {len(sessions)}")
        
        if not sessions:
            print("No training sessions found")
            return
        
        # Analyze sessions
        today = datetime.utcnow().date()
        today_sessions = []
        
        for i, session in enumerate(sessions):
            session_date = session.get("createdAt", datetime.utcnow()).date()
            is_today = session_date == today
            is_complete = session.get("isComplete", False)
            focus_areas = session.get("focusAreas", [])
            
            print(f"\n📝 Session {i+1}:")
            print(f"   Date: {session_date}")
            print(f"   Today: {is_today}")
            print(f"   Complete: {is_complete}")
            print(f"   Focus Areas: {focus_areas}")
            print(f"   Mood: {session.get('mood', 'N/A')}")
            
            if session.get("exercises"):
                print(f"   Exercises:")
                for ex in session["exercises"]:
                    print(f"     - {ex.get('name', 'N/A')} (type: {ex.get('type', 'N/A')})")
            
            if is_today:
                today_sessions.append(session)
        
        print(f"\n🎯 Today's sessions: {len(today_sessions)}")
        
        # Analyze focus areas from today's sessions
        if today_sessions:
            all_focus_areas = set()
            for session in today_sessions:
                if session.get("isComplete", False):
                    focus_areas = session.get("focusAreas", [])
                    all_focus_areas.update(focus_areas)
            
            print(f"🎯 Focus areas from today's completed sessions: {list(all_focus_areas)}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(check_monday_sessions())