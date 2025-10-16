import asyncio
import sys
import os
sys.path.append('./backend')

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from progress.logic import _calculate_focus_area_analytics

load_dotenv('./backend/.env')

async def debug_mbuser2_progress():
    """Debug mbuser2's progress calculation step by step"""
    
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
        
        for i, session in enumerate(sessions, 1):
            print(f"\n--- Session {i} ---")
            print(f"Created: {session.get('createdAt')}")
            print(f"Focus Areas: {session.get('focusAreas', [])}")
            print(f"Average Score: {session.get('averageScore', 'N/A')}")
            
            exercise_results = session.get('exerciseResults', [])
            print(f"Exercise Results: {len(exercise_results)} exercises")
            
            if exercise_results:
                all_scores = [result.get('score', 0) for result in exercise_results]
                avg_score = sum(all_scores) / len(all_scores) if all_scores else 0
                print(f"  Individual scores: {all_scores}")
                print(f"  Calculated average: {avg_score:.2f}%")
        
        # Test the focus area analytics calculation
        print(f"\n🔍 Testing focus area analytics calculation...")
        focus_areas_analytics = await _calculate_focus_area_analytics(sessions, db)
        
        print(f"📈 Focus Areas Analytics: {len(focus_areas_analytics)} areas")
        for analytics in focus_areas_analytics:
            print(f"  - {analytics.area_name}: current={analytics.current_score:.2f}%, avg={analytics.average_score:.2f}%, sessions={analytics.sessions_count}")
        
        if not focus_areas_analytics:
            print("❌ No focus area analytics generated!")
            print("🔍 Debugging the calculation logic...")
            
            # Manual debug of the logic
            from collections import defaultdict
            focus_area_data = defaultdict(list)
            
            for session in sessions:
                session_date = session.get("createdAt")
                exercise_results = session.get("exerciseResults", [])
                session_focus_areas = session.get("focusAreas", [])
                
                print(f"\n🔍 Processing session:")
                print(f"  Date: {session_date}")
                print(f"  Focus Areas: {session_focus_areas}")
                print(f"  Exercise Results: {len(exercise_results)} exercises")
                
                if not exercise_results or not session_focus_areas:
                    print(f"  ⚠️ Missing data - using fallback")
                    session_score = session.get("averageScore", 0.0)
                    for area in session_focus_areas:
                        focus_area_data[area].append({
                            "score": session_score,
                            "date": session_date
                        })
                        print(f"    Added {area}: {session_score}")
                else:
                    all_exercise_scores = [result.get("score", 0.0) for result in exercise_results]
                    session_average_score = sum(all_exercise_scores) / len(all_exercise_scores)
                    print(f"  📊 Session average score: {session_average_score:.2f}%")
                    
                    for focus_area in session_focus_areas:
                        focus_area_data[focus_area].append({
                            "score": session_average_score,
                            "date": session_date
                        })
                        print(f"    Added {focus_area}: {session_average_score:.2f}%")
            
            print(f"\n📊 Final focus_area_data: {dict(focus_area_data)}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(debug_mbuser2_progress())