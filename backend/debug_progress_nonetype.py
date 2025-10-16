import asyncio
import sys
import traceback
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Add current directory to path for imports
sys.path.append('.')

load_dotenv()

async def debug_progress_nonetype_error():
    """
    Debug script to reproduce and identify the exact location of the NoneType error
    in progress calculation logic
    """
    client = AsyncIOMotorClient(os.getenv('MONGODB_URI'))
    db = client.mindbloom
    
    # Find a user with exercise data (mbuser2 from terminal logs)
    user = await db.users.find_one({'email': 'mbuser2@example.com'})
    if not user:
        print('❌ Test user not found')
        return
    
    user_id = str(user['_id'])
    print(f'✅ Found test user: {user_id}')
    
    try:
        # Import and test each function individually to isolate the error
        print('\n🔍 TESTING INDIVIDUAL FUNCTIONS...')
        
        # Test 1: Basic session fetching
        print('\n1️⃣ Testing session fetching...')
        cursor = db.training_sessions.find({"userId": user['_id']}).sort("createdAt", 1)
        sessions = []
        async for session in cursor:
            if session.get("isComplete", False) or session.get("exerciseResults", []):
                sessions.append(session)
        
        print(f'   ✅ Found {len(sessions)} sessions with data')
        
        # Test 2: Basic statistics calculation
        print('\n2️⃣ Testing basic statistics...')
        all_scores = []
        for session in sessions:
            avg_score = session.get("averageScore")
            print(f'   Session averageScore: {avg_score} (type: {type(avg_score)})')
            if avg_score is not None:
                all_scores.append(avg_score)
        
        print(f'   ✅ Collected {len(all_scores)} non-None scores: {all_scores}')
        
        if all_scores:
            import statistics
            overall_avg = statistics.mean(all_scores)
            best_score = max(all_scores)
            print(f'   ✅ Overall average: {overall_avg}, Best: {best_score}')
        
        # Test 3: Focus area analytics calculation
        print('\n3️⃣ Testing focus area analytics...')
        from progress.logic import _calculate_focus_area_analytics
        
        try:
            focus_analytics = await _calculate_focus_area_analytics(sessions, db)
            print(f'   ✅ Focus area analytics calculated: {len(focus_analytics)} areas')
            
            for analytics in focus_analytics:
                print(f'     - {analytics.area_name}: current={analytics.current_score}, avg={analytics.average_score}')
                print(f'       Types: current={type(analytics.current_score)}, avg={type(analytics.average_score)}')
        except Exception as e:
            print(f'   ❌ ERROR in _calculate_focus_area_analytics: {e}')
            print(f'   📍 Traceback: {traceback.format_exc()}')
            return
        
        # Test 4: Performance pattern analysis
        print('\n4️⃣ Testing performance pattern analysis...')
        from progress.logic import _analyze_performance_patterns
        
        try:
            improvement_areas, strengths = _analyze_performance_patterns(focus_analytics)
            print(f'   ✅ Pattern analysis completed')
            print(f'     Strengths: {strengths}')
            print(f'     Improvement areas: {improvement_areas}')
        except Exception as e:
            print(f'   ❌ ERROR in _analyze_performance_patterns: {e}')
            print(f'   📍 Traceback: {traceback.format_exc()}')
            
            # Detailed debugging of the problematic function
            print('\n🔍 DETAILED DEBUGGING OF _analyze_performance_patterns:')
            for i, analytics in enumerate(focus_analytics):
                print(f'     Analytics {i+1}: {analytics.area_name}')
                print(f'       current_score: {analytics.current_score} (type: {type(analytics.current_score)})')
                print(f'       average_score: {analytics.average_score} (type: {type(analytics.average_score)})')
                
                # Test the normalization logic that's likely causing the error
                try:
                    current_score = analytics.current_score / 100.0 if analytics.current_score > 1.0 else analytics.current_score
                    print(f'       normalized current_score: {current_score}')
                except Exception as norm_e:
                    print(f'       ❌ ERROR normalizing current_score: {norm_e}')
                
                try:
                    average_score = analytics.average_score / 100.0 if analytics.average_score > 1.0 else analytics.average_score
                    print(f'       normalized average_score: {average_score}')
                except Exception as norm_e:
                    print(f'       ❌ ERROR normalizing average_score: {norm_e}')
            return
        
        # Test 5: Full progress analytics
        print('\n5️⃣ Testing full progress analytics...')
        from progress.logic import get_progress_analytics
        
        try:
            progress_summary = await get_progress_analytics(user_id, db)
            print(f'   ✅ Full progress analytics completed')
            print(f'     Total sessions: {progress_summary.total_sessions}')
            print(f'     Overall average: {progress_summary.overall_average_score}')
        except Exception as e:
            print(f'   ❌ ERROR in get_progress_analytics: {e}')
            print(f'   📍 Traceback: {traceback.format_exc()}')
            return
        
        print('\n🎉 ALL TESTS PASSED - No NoneType error reproduced')
        
    except Exception as e:
        print(f'\n❌ CRITICAL ERROR: {e}')
        print(f'📍 Full traceback: {traceback.format_exc()}')
    
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(debug_progress_nonetype_error())