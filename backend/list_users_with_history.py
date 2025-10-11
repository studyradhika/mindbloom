#!/usr/bin/env python3
"""
Script to list users in the database and their performance history
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def list_users_with_history():
    # Connect to MongoDB using environment variable
    mongodb_uri = os.getenv("MONGODB_URI")
    if not mongodb_uri:
        print("❌ MONGODB_URI not found in environment variables")
        return
    
    client = AsyncIOMotorClient(mongodb_uri)
    db = client.mindbloom
    
    print("=" * 80)
    print("MINDBLOOM DATABASE - USERS WITH PERFORMANCE HISTORY")
    print("=" * 80)
    
    # Get all users
    users_cursor = db.users.find({})
    users = await users_cursor.to_list(length=None)
    
    print(f"\nTotal users in database: {len(users)}")
    print("-" * 80)
    
    users_with_sessions = 0
    
    for user in users:
        user_id = str(user["_id"])
        name = user.get("name", "Unknown")
        email = user.get("email", "Unknown")
        streak = user.get("streak", 0)
        total_sessions = user.get("totalSessions", 0)
        created_at = user.get("createdAt", "Unknown")
        
        # Get training sessions for this user
        sessions_cursor = db.training_sessions.find({"userId": user_id})
        sessions = await sessions_cursor.to_list(length=None)
        
        print(f"\n👤 USER: {name} ({email})")
        print(f"   User ID: {user_id}")
        print(f"   Created: {created_at}")
        print(f"   Streak: {streak} days")
        print(f"   Total Sessions (user record): {total_sessions}")
        print(f"   Training Sessions in DB: {len(sessions)}")
        
        if sessions:
            users_with_sessions += 1
            print(f"   📊 PERFORMANCE HISTORY:")
            
            for i, session in enumerate(sessions, 1):
                session_id = str(session["_id"])
                mood = session.get("mood", "Unknown")
                focus_areas = session.get("focusAreas", [])
                is_complete = session.get("isComplete", False)
                created_at = session.get("createdAt", "Unknown")
                completed_at = session.get("completedAt", "Not completed")
                average_score = session.get("averageScore", "No score")
                exercise_results = session.get("exerciseResults", [])
                
                print(f"      Session {i}: {session_id}")
                print(f"         Created: {created_at}")
                print(f"         Completed: {completed_at}")
                print(f"         Status: {'✅ Complete' if is_complete else '⏳ Incomplete'}")
                print(f"         Mood: {mood}")
                print(f"         Focus Areas: {', '.join(focus_areas) if focus_areas else 'None'}")
                print(f"         Average Score: {average_score}")
                print(f"         Exercise Results: {len(exercise_results)} exercises")
                
                if exercise_results:
                    print(f"         📋 EXERCISES:")
                    for j, result in enumerate(exercise_results, 1):
                        exercise_id = result.get("exerciseId", "Unknown")
                        score = result.get("score", "No score")
                        time_spent = result.get("timeSpent", "No time")
                        print(f"            {j}. {exercise_id}: {score}% ({time_spent}s)")
                
                print()
        else:
            print(f"   ❌ No training sessions found")
        
        print("-" * 80)
    
    print(f"\n📈 SUMMARY:")
    print(f"   Total users: {len(users)}")
    print(f"   Users with performance history: {users_with_sessions}")
    print(f"   Users without performance history: {len(users) - users_with_sessions}")
    
    # Get total training sessions across all users
    total_sessions_cursor = db.training_sessions.find({})
    all_sessions = await total_sessions_cursor.to_list(length=None)
    completed_sessions = [s for s in all_sessions if s.get("isComplete", False)]
    
    print(f"   Total training sessions in database: {len(all_sessions)}")
    print(f"   Completed training sessions: {len(completed_sessions)}")
    print(f"   Incomplete training sessions: {len(all_sessions) - len(completed_sessions)}")
    
    print("=" * 80)
    
    # Close the connection
    client.close()

if __name__ == "__main__":
    asyncio.run(list_users_with_history())