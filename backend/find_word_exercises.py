import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def find_word_exercises():
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
    
    # Find all training sessions with exercise results
    sessions_with_results = await db.training_sessions.find({
        "userId": user_id,
        "exerciseResults": {"$exists": True, "$ne": None}
    }).to_list(None)
    
    print(f"\n📊 Found {len(sessions_with_results)} sessions with exercise results")
    
    word_related_exercises = []
    all_exercise_ids = set()
    
    for session in sessions_with_results:
        print(f"\n🎯 Session {session['_id']} (Created: {session.get('createdAt')})")
        
        if session.get("exerciseResults"):
            for result in session["exerciseResults"]:
                exercise_id = result.get("exerciseId", "unknown")
                all_exercise_ids.add(exercise_id)
                
                # Look for word-related exercises
                if any(word in exercise_id.lower() for word in ["word", "sequence", "memory", "language", "verbal"]):
                    word_related_exercises.append({
                        "session_id": session["_id"],
                        "created": session.get("createdAt"),
                        "exercise_id": exercise_id,
                        "result": result
                    })
                    print(f"  🔤 WORD-RELATED: {exercise_id} (score: {result.get('score', 'N/A')})")
                else:
                    print(f"  📝 {exercise_id} (score: {result.get('score', 'N/A')})")
    
    print(f"\n🎯 All unique exercise IDs found: {sorted(all_exercise_ids)}")
    
    if word_related_exercises:
        print(f"\n🔤 WORD-RELATED EXERCISES FOUND ({len(word_related_exercises)}):")
        for i, word_ex in enumerate(word_related_exercises, 1):
            result = word_ex["result"]
            print(f"\n--- Word Exercise {i} ---")
            print(f"Session: {word_ex['session_id']}")
            print(f"Date: {word_ex['created']}")
            print(f"Exercise: {word_ex['exercise_id']}")
            print(f"Score: {result.get('score', 'N/A')}")
            print(f"Time Spent: {result.get('timeSpent', 'N/A')} seconds")
            print(f"Category: {result.get('category', 'N/A')}")
            
            # Check for scoring issues
            if "taskScores" in result or "individualScores" in result:
                task_scores = result.get("taskScores") or result.get("individualScores", [])
                if task_scores:
                    avg_calculated = sum(task_scores) / len(task_scores)
                    recorded_score = result.get('score', 0)
                    print(f"Individual Scores: {task_scores}")
                    print(f"Calculated Average: {avg_calculated:.1f}%")
                    print(f"Recorded Score: {recorded_score}%")
                    
                    if abs(avg_calculated - recorded_score) > 1:
                        print(f"⚠️  SCORING DISCREPANCY DETECTED!")
                        print(f"   Expected: {avg_calculated:.1f}%, Got: {recorded_score}%")
    else:
        print(f"\n❌ No word-related exercises found")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(find_word_exercises())