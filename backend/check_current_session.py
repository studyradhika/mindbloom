import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

async def check_current_session():
    # Connect to MongoDB
    mongodb_uri = os.getenv("MONGODB_URI")
    client = AsyncIOMotorClient(mongodb_uri)
    db = client.mindbloom
    
    # Find Radhika's user record
    user = await db.users.find_one({"email": "rmsatapathy@yahoo.com"})
    if not user:
        print("❌ User rmsatapathy@yahoo.com not found")
        return
    
    user_id = str(user["_id"])
    print(f"👤 Found user: {user['name']} ({user['email']})")
    print(f"   User ID: {user_id}")
    
    # Find the most recent training session for this user
    recent_session = await db.training_sessions.find_one(
        {"userId": user_id}, 
        sort=[("createdAt", -1)]
    )
    
    if not recent_session:
        print("❌ No training sessions found")
        return
    
    print(f"\n🎯 MOST RECENT SESSION:")
    print(f"Session ID: {recent_session['_id']}")
    print(f"Created: {recent_session.get('createdAt')}")
    print(f"Completed: {recent_session.get('completedAt', 'Not completed')}")
    print(f"Is Complete: {recent_session.get('isComplete', False)}")
    print(f"Mood: {recent_session.get('mood', 'N/A')}")
    print(f"Focus Areas: {recent_session.get('focusAreas', [])}")
    print(f"Average Score: {recent_session.get('averageScore', 'N/A')}")
    
    # Show exercises that were assigned
    if recent_session.get("exercises"):
        print(f"\n📋 EXERCISES ASSIGNED ({len(recent_session['exercises'])}):")
        for i, exercise in enumerate(recent_session["exercises"], 1):
            print(f"  {i}. {exercise.get('name', 'Unknown')} (ID: {exercise.get('id', 'N/A')})")
            print(f"     Type: {exercise.get('type', 'N/A')}")
            print(f"     Difficulty: {exercise.get('difficulty', 'N/A')}")
            print(f"     Estimated Time: {exercise.get('estimatedTime', 'N/A')} seconds")
    
    # Show exercise results
    if recent_session.get("exerciseResults"):
        print(f"\n✅ EXERCISE RESULTS ({len(recent_session['exerciseResults'])}):")
        for i, result in enumerate(recent_session["exerciseResults"], 1):
            exercise_id = result.get("exerciseId", "unknown")
            score = result.get("score", "N/A")
            time_spent = result.get("timeSpent", "N/A")
            category = result.get("category", "N/A")
            
            print(f"  {i}. {exercise_id}")
            print(f"     Score: {score}")
            print(f"     Time Spent: {time_spent} seconds")
            print(f"     Category: {category}")
            
            # Special handling for sequencing exercise
            if exercise_id == "sequencing":
                print(f"     🎯 SEQUENCING EXERCISE DETAILS:")
                if "taskScores" in result:
                    task_scores = result["taskScores"]
                    print(f"     Individual Task Scores: {task_scores}")
                    if task_scores:
                        avg_calculated = sum(task_scores) / len(task_scores)
                        print(f"     Calculated Average: {avg_calculated:.1f}%")
                        print(f"     Recorded Score: {score}%")
                        if abs(avg_calculated - score) > 1:
                            print(f"     ⚠️  SCORING DISCREPANCY!")
                
                if "tasksCompleted" in result:
                    print(f"     Tasks Completed: {result['tasksCompleted']}")
    else:
        print(f"\n❌ No exercise results found in this session")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_current_session())