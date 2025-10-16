import asyncio
import sys
import os
sys.path.append('./backend')

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from progress.logic import _calculate_focus_area_analytics

load_dotenv('./backend/.env')

async def test_improvement_status():
    """Test the improvement status calculation for mbuser2"""
    
    client = AsyncIOMotorClient(os.getenv('MONGODB_URI'))
    db = client.mindbloom
    
    try:
        # Find mbuser2
        user = await db.users.find_one({'email': 'mbuser2@example.com'})
        if not user:
            print("❌ mbuser2 not found")
            return
            
        user_id = str(user['_id'])
        print(f"✅ Found mbuser2: {user['email']} (ID: {user_id})")
        
        # Get all training sessions
        cursor = db.training_sessions.find({'userId': user_id, 'isComplete': True})
        sessions = []
        async for session in cursor:
            sessions.append(session)
        
        print(f"\n📊 Training Sessions: {len(sessions)}")
        
        # Test the focus area analytics calculation with detailed output
        focus_areas_analytics = await _calculate_focus_area_analytics(sessions, db)
        
        print(f"\n📈 Focus Areas Analytics with Improvement Status:")
        for analytics in focus_areas_analytics:
            print(f"  - {analytics.area_name}:")
            print(f"    Current Score: {analytics.current_score:.2f}%")
            print(f"    Average Score: {analytics.average_score:.2f}%")
            print(f"    Sessions Count: {analytics.sessions_count}")
            print(f"    Improvement Status: {analytics.improvement_status}")
            print(f"    Expected Status: {'improving' if analytics.current_score >= 70.0 else 'stable' if analytics.current_score >= 60.0 else 'declining'}")
            print()
        
        # Check what the individual exercise scores were
        for session in sessions:
            exercise_results = session.get('exerciseResults', [])
            print(f"📊 Individual Exercise Scores:")
            for result in exercise_results:
                exercise_id = result.get('exerciseId', 'unknown')
                score = result.get('score', 0)
                print(f"  - {exercise_id}: {score}%")
            
            # Calculate what the session average should be
            all_scores = [result.get('score', 0) for result in exercise_results]
            session_avg = sum(all_scores) / len(all_scores) if all_scores else 0
            print(f"  Session Average: {session_avg:.2f}%")
            
            # Show focus areas
            focus_areas = session.get('focusAreas', [])
            print(f"  Focus Areas: {focus_areas}")
            
            print(f"\n🎯 Expected Improvement Status Logic:")
            print(f"  - For new users (1 session):")
            print(f"    * ≥80%: improving")
            print(f"    * ≥70%: improving") 
            print(f"    * ≥60%: stable")
            print(f"    * <60%: declining")
            print(f"  - Current score {session_avg:.2f}% should be: {'improving' if session_avg >= 70.0 else 'stable' if session_avg >= 60.0 else 'declining'}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(test_improvement_status())