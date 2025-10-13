import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime
from bson import ObjectId
from progress.logic import recalculate_user_progress

# Load environment variables
load_dotenv()

async def create_test_session_memory_attention_general():
    """Create a test session with memory, general, attention focus areas and 100% scores"""
    
    client = AsyncIOMotorClient(os.getenv('MONGODB_URI'))
    db = client.mindbloom
    
    try:
        # Find user1 (we'll use them for the test)
        user1 = await db.users.find_one({'email': 'user1@example.com'})
        if not user1:
            print('User1 not found')
            return
        
        user_id = str(user1['_id'])
        print(f'Creating test session for user1: {user_id}')
        print(f'Focus areas: memory, general, attention')
        
        # Create exercise results with 100% scores (1.0) for memory, general, attention
        exercise_results = [
            {
                'exerciseId': 'memory_sequence',  # memory
                'score': 1.0,  # 100%
                'timeSpent': 180
            },
            {
                'exerciseId': 'mindful_breathing',  # general
                'score': 1.0,  # 100%
                'timeSpent': 240
            },
            {
                'exerciseId': 'focused_attention',  # attention -> but this maps to 'perception' in our mapping!
                'score': 1.0,  # 100%
                'timeSpent': 120
            }
        ]
        
        # Wait, I need to check the exercise mapping. Let me use correct exercises:
        exercise_results = [
            {
                'exerciseId': 'memory_sequence',  # maps to 'memory'
                'score': 1.0,  # 100%
                'timeSpent': 180
            },
            {
                'exerciseId': 'mindful_breathing',  # maps to 'general'
                'score': 1.0,  # 100%
                'timeSpent': 240
            },
            {
                'exerciseId': 'divided_attention',  # maps to 'attention'
                'score': 1.0,  # 100%
                'timeSpent': 120
            }
        ]
        
        # Calculate average score (should be 1.0)
        average_score = sum(result['score'] for result in exercise_results) / len(exercise_results)
        
        print(f'Creating session with average score: {average_score}')
        
        # Create the training session
        session_doc = {
            'userId': user_id,
            'mood': 'focused',
            'focusAreas': ['memory', 'general', 'attention'],
            'exercises': [],  # We don't need this for completed sessions
            'exerciseResults': exercise_results,
            'averageScore': average_score,
            'isComplete': True,
            'createdAt': datetime.utcnow(),
            'completedAt': datetime.utcnow()
        }
        
        # Insert the session
        result = await db.training_sessions.insert_one(session_doc)
        session_id = str(result.inserted_id)
        
        print(f'✅ Test session created with ID: {session_id}')
        print(f'Exercise results: {exercise_results}')
        print(f'Average score: {average_score}')
        
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
        
        # Now test the progress calculation
        print('\n=== TESTING PROGRESS CALCULATION ===')
        progress = await recalculate_user_progress(user_id, db)
        
        print(f'Progress calculation results:')
        print(f'  Improvement Areas: {progress["improvement_areas"]}')
        print(f'  Strengths: {progress["strengths"]}')
        
        # Expected results:
        # - memory, general, attention should be in "strengths" (100% scores)
        # - executive, creativity, processing should also be in "strengths" (from previous sessions)
        
        print('\n=== EXPECTED vs ACTUAL ===')
        expected_strengths = ['memory', 'general', 'attention', 'executive', 'creativity', 'processing']
        actual_strengths = progress["strengths"]
        
        print(f'Expected strengths: {expected_strengths}')
        print(f'Actual strengths: {actual_strengths}')
        
        # Check if memory, general, attention are correctly categorized
        memory_correct = 'memory' in actual_strengths
        general_correct = 'general' in actual_strengths  
        attention_correct = 'attention' in actual_strengths
        
        print(f'\n✅ Memory correctly categorized as strength: {memory_correct}')
        print(f'✅ General correctly categorized as strength: {general_correct}')
        print(f'✅ Attention correctly categorized as strength: {attention_correct}')
        
        if memory_correct and general_correct and attention_correct:
            print('\n🎉 SUCCESS: All focus areas with 100% scores are correctly categorized as strengths!')
        else:
            print('\n❌ ISSUE: Some focus areas with 100% scores are not categorized correctly')
        
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(create_test_session_memory_attention_general())