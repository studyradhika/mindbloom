import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime
from bson import ObjectId

# Load environment variables
load_dotenv()

async def simulate_user1_completion():
    """Simulate user1 completing their training session with 100% scores"""
    
    client = AsyncIOMotorClient(os.getenv('MONGODB_URI'))
    db = client.mindbloom
    
    try:
        # Find user1
        user1 = await db.users.find_one({'email': 'user1@example.com'})
        if not user1:
            print('User1 not found')
            return
        
        user_id = str(user1['_id'])
        print(f'Found user1: {user_id}')
        
        # Find their most recent incomplete session
        session = await db.training_sessions.find_one(
            {'userId': user_id, 'isComplete': False},
            sort=[('createdAt', -1)]
        )
        
        if not session:
            print('No incomplete session found')
            return
        
        session_id = session['_id']
        focus_areas = session.get('focusAreas', [])
        print(f'Found incomplete session: {session_id}')
        print(f'Focus areas: {focus_areas}')
        
        # Create exercise results with 100% scores (1.0)
        exercise_results = [
            {
                'exerciseId': 'planning_task',  # executive
                'score': 1.0,  # 100%
                'timeSpent': 180
            },
            {
                'exerciseId': 'alternative_uses',  # creativity
                'score': 1.0,  # 100%
                'timeSpent': 240
            },
            {
                'exerciseId': 'speed_processing',  # processing
                'score': 1.0,  # 100%
                'timeSpent': 120
            }
        ]
        
        # Calculate average score (should be 1.0)
        average_score = sum(result['score'] for result in exercise_results) / len(exercise_results)
        
        print(f'Simulating completion with average score: {average_score}')
        
        # Update the session to completed
        await db.training_sessions.update_one(
            {'_id': session_id},
            {
                '$set': {
                    'exerciseResults': exercise_results,
                    'averageScore': average_score,
                    'isComplete': True,
                    'completedAt': datetime.utcnow()
                }
            }
        )
        
        # Update user stats
        await db.users.update_one(
            {'_id': ObjectId(user_id)},
            {
                '$inc': {
                    'streak': 1,
                    'totalSessions': 1
                }
            }
        )
        
        print('✅ Session completed successfully!')
        print(f'Exercise results: {exercise_results}')
        print(f'Average score: {average_score}')
        
        # Now test the progress calculation
        from progress.logic import get_progress_analytics
        
        print('\n=== TESTING PROGRESS CALCULATION ===')
        progress = await get_progress_analytics(user_id, db)
        
        print(f'Total sessions: {progress.total_sessions}')
        print(f'Overall average score: {progress.overall_average_score}')
        print(f'Focus areas analytics:')
        
        for analytics in progress.focus_areas_analytics:
            print(f'  {analytics.area_name}:')
            print(f'    Current Score: {analytics.current_score}')
            print(f'    Average Score: {analytics.average_score}')
            print(f'    Sessions Count: {analytics.sessions_count}')
            print(f'    Improvement Status: {analytics.improvement_status}')
        
        print(f'\nCategorization:')
        print(f'  Improvement Areas: {progress.improvement_areas}')
        print(f'  Strengths: {progress.strengths}')
        
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(simulate_user1_completion())