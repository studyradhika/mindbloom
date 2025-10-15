import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

async def check_radhika_sessions():
    # Connect to MongoDB
    mongodb_uri = os.getenv("MONGODB_URI")
    client = AsyncIOMotorClient(mongodb_uri)
    db = client.mindbloom
    
    # Find Radhika's user record
    user = await db.users.find_one({"email": "rmsatapathy@yahoo.com"})
    if not user:
        print("❌ User rmsatapathy@yahoo.com not found")
        return
    
    user_id = user["_id"]
    print(f"👤 Found user: {user['name']} ({user['email']})")
    print(f"   User ID: {user_id}")
    
    # Find all training sessions for this user (using correct field name and string format)
    sessions = await db.training_sessions.find({"userId": str(user_id)}).to_list(None)
    print(f"📊 Found {len(sessions)} training sessions")
    
    # Look for sessions with sequencing exercises
    sequencing_sessions = []
    for session in sessions:
        if session.get("exerciseResults"):
            for result in session["exerciseResults"]:
                if result.get("exerciseId") == "sequencing":
                    sequencing_sessions.append({
                        "session_id": session["_id"],
                        "created": session.get("createdAt"),
                        "result": result
                    })
    
    print(f"\n🔍 Found {len(sequencing_sessions)} sessions with sequencing exercises:")
    
    for i, seq_session in enumerate(sequencing_sessions, 1):
        result = seq_session["result"]
        print(f"\n--- Session {i} ---")
        print(f"Session ID: {seq_session['session_id']}")
        print(f"Date: {seq_session['created']}")
        print(f"Score: {result.get('score', 'N/A')}")
        print(f"Time Spent: {result.get('timeSpent', 'N/A')} seconds")
        print(f"Tasks Completed: {result.get('tasksCompleted', 'N/A')}")
        
        if "taskScores" in result:
            print(f"Individual Task Scores: {result['taskScores']}")
        
        # Check if there are any scoring anomalies
        score = result.get('score', 0)
        task_scores = result.get('taskScores', [])
        
        if task_scores:
            avg_task_score = sum(task_scores) / len(task_scores)
            print(f"Calculated Average: {avg_task_score:.1f}%")
            print(f"Recorded Score: {score}%")
            
            if abs(avg_task_score - score) > 1:  # More than 1% difference
                print(f"⚠️  SCORING DISCREPANCY DETECTED!")
                print(f"   Expected: {avg_task_score:.1f}%, Got: {score}%")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_radhika_sessions())