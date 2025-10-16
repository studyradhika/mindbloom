#!/usr/bin/env python3

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def check_mbuser2_sessions():
    client = AsyncIOMotorClient(os.getenv('MONGODB_URI'))
    db = client.mindbloom
    
    # Find mbuser2 by ID from the terminal output
    user_id = "68eff33f693b798d37beafcf"
    
    print(f"🔍 Checking sessions for mbuser2 (ID: {user_id})")
    
    # Get their training sessions
    sessions = []
    async for session in db.training_sessions.find({'userId': user_id}):
        sessions.append(session)
    
    print(f"\n📊 Found {len(sessions)} training sessions:")
    
    all_exercise_scores = []
    
    for i, session in enumerate(sessions, 1):
        print(f"\n🎯 Session {i}:")
        print(f"  - Session ID: {session['_id']}")
        print(f"  - Focus Areas: {session.get('focusAreas', [])}")
        print(f"  - Complete: {session.get('isComplete', False)}")
        print(f"  - Session Average Score: {session.get('averageScore', 'N/A')}")
        print(f"  - Created: {session.get('createdAt')}")
        
        exercise_results = session.get('exerciseResults', [])
        print(f"  - Exercise Results ({len(exercise_results)} exercises):")
        
        session_scores = []
        for j, result in enumerate(exercise_results, 1):
            exercise_id = result.get('exerciseId', 'unknown')
            score = result.get('score', 0)
            time_spent = result.get('timeSpent', 0)
            completed_at = result.get('completedAt', 'N/A')
            
            print(f"    {j}. Exercise: {exercise_id}")
            print(f"       Score: {score}%")
            print(f"       Time: {time_spent}s")
            print(f"       Completed: {completed_at}")
            
            if score > 0:  # Only count non-zero scores
                session_scores.append(score)
                all_exercise_scores.append(score)
        
        if session_scores:
            manual_session_avg = sum(session_scores) / len(session_scores)
            print(f"  - Manual Session Average: {manual_session_avg:.2f}%")
            print(f"  - Session Scores: {session_scores}")
    
    # Calculate overall average
    if all_exercise_scores:
        overall_avg = sum(all_exercise_scores) / len(all_exercise_scores)
        print(f"\n📈 Overall Performance Analysis:")
        print(f"  - All Exercise Scores: {all_exercise_scores}")
        print(f"  - Total Valid Exercises: {len(all_exercise_scores)}")
        print(f"  - Sum of All Scores: {sum(all_exercise_scores)}")
        print(f"  - Calculated Overall Average: {overall_avg:.2f}%")
        
        # Check if this matches the 66% we saw in the logs
        if abs(overall_avg - 66.22) < 1:
            print(f"  ✅ This matches the 66.22% average from the terminal logs!")
        else:
            print(f"  ❓ This doesn't match the 66.22% from logs - investigating...")
    else:
        print(f"\n❌ No valid exercise scores found")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_mbuser2_sessions())