import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

async def check_completed_sessions():
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
    
    # Find all training sessions for this user, sorted by creation date (newest first)
    sessions = await db.training_sessions.find(
        {"userId": user_id}
    ).sort("createdAt", -1).to_list(None)
    
    print(f"\n📊 Found {len(sessions)} total sessions")
    
    # Look for sessions with exercise results
    completed_sessions = []
    for session in sessions:
        if session.get("exerciseResults") and len(session["exerciseResults"]) > 0:
            completed_sessions.append(session)
    
    print(f"✅ Found {len(completed_sessions)} sessions with exercise results")
    
    if completed_sessions:
        print(f"\n🎯 MOST RECENT COMPLETED SESSION:")
        latest_completed = completed_sessions[0]
        
        print(f"Session ID: {latest_completed['_id']}")
        print(f"Created: {latest_completed.get('createdAt')}")
        print(f"Completed: {latest_completed.get('completedAt', 'N/A')}")
        print(f"Is Complete: {latest_completed.get('isComplete', False)}")
        print(f"Average Score: {latest_completed.get('averageScore', 'N/A')}")
        
        # Show exercise results
        exercise_results = latest_completed.get("exerciseResults", [])
        print(f"\n📋 EXERCISE RESULTS ({len(exercise_results)}):")
        
        for i, result in enumerate(exercise_results, 1):
            exercise_id = result.get("exerciseId", "unknown")
            score = result.get("score", "N/A")
            time_spent = result.get("timeSpent", "N/A")
            category = result.get("category", "N/A")
            
            print(f"\n  {i}. {exercise_id}")
            print(f"     Score: {score}")
            print(f"     Time Spent: {time_spent} seconds")
            print(f"     Category: {category}")
            
            # Look for pattern memory or processing speed exercises
            if "speed" in exercise_id.lower() or "pattern" in exercise_id.lower() or "processing" in exercise_id.lower():
                print(f"     🎯 PROCESSING/PATTERN EXERCISE FOUND!")
                
                # Show all available data for this exercise
                print(f"     📊 Full Exercise Data:")
                for key, value in result.items():
                    if key not in ["exerciseId", "score", "timeSpent", "category"]:
                        print(f"       {key}: {value}")
                
                # Check for scoring issues
                if "correctAnswers" in result and "totalQuestions" in result:
                    correct = result["correctAnswers"]
                    total = result["totalQuestions"]
                    expected_score = (correct / total) * 100 if total > 0 else 0
                    actual_score = score * 100 if isinstance(score, float) else score
                    
                    print(f"     🧮 SCORING ANALYSIS:")
                    print(f"       Correct Answers: {correct}/{total}")
                    print(f"       Expected Score: {expected_score:.1f}%")
                    print(f"       Actual Score: {actual_score}%")
                    
                    if abs(expected_score - actual_score) > 1:
                        print(f"       ⚠️  SCORING DISCREPANCY!")
                        print(f"       Difference: {abs(expected_score - actual_score):.1f}%")
    else:
        print(f"\n❌ No completed sessions found yet")
        
        # Show the 3 most recent sessions for context
        print(f"\n📋 RECENT SESSIONS (showing up to 3):")
        for i, session in enumerate(sessions[:3], 1):
            print(f"\n  {i}. Session {session['_id']}")
            print(f"     Created: {session.get('createdAt')}")
            print(f"     Complete: {session.get('isComplete', False)}")
            exercise_results = session.get('exerciseResults', [])
            result_count = len(exercise_results) if exercise_results else 0
            print(f"     Exercise Results: {result_count}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_completed_sessions())