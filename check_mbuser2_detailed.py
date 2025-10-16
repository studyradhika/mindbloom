import asyncio
import sys
import os
sys.path.append('./backend')

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime
from collections import defaultdict

load_dotenv('./backend/.env')

async def check_mbuser2_detailed():
    """Check mbuser2's detailed training session data"""
    
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
        cursor = db.training_sessions.find({'userId': user_id})
        sessions = []
        async for session in cursor:
            sessions.append(session)
        
        print(f"\n📊 Training Sessions: {len(sessions)}")
        
        for i, session in enumerate(sessions, 1):
            print(f"\n--- Session {i} ---")
            print(f"Created: {session.get('createdAt')}")
            print(f"Complete: {session.get('isComplete', False)}")
            print(f"Focus Areas: {session.get('focusAreas', [])}")
            print(f"Average Score: {session.get('averageScore', 'N/A')}")
            print(f"Mood: {session.get('mood', 'N/A')}")
            
            exercise_results = session.get('exerciseResults', [])
            print(f"Exercise Results: {len(exercise_results)} exercises")
            
            if exercise_results:
                print("  Exercises:")
                exercise_to_area_map = {
                    # Memory exercises
                    'memory_sequence': 'memory',
                    'word_pairs': 'memory',
                    'visual_recall': 'memory',
                    'working_memory': 'memory',
                    # Attention exercises
                    'attention': 'attention',
                    'divided_attention': 'attention',
                    'sustained_attention': 'attention',
                    'selective_attention': 'attention',
                    # Language exercises
                    'word_finding': 'language',
                    'sentence_completion': 'language',
                    'verbal_fluency': 'language',
                    'reading_comprehension': 'language',
                    'conversation': 'language',  # Conversation exercise
                    # Executive exercises
                    'planning_task': 'executive',
                    'cognitive_flexibility': 'executive',
                    'inhibition_control': 'executive',
                    'task_switching': 'executive',
                    'sequencing': 'executive',  # Sequencing exercise
                    # Processing Speed exercises
                    'speed_processing': 'processing',
                    'rapid_naming': 'processing',
                    'symbol_coding': 'processing',
                    # Spatial Reasoning exercises
                    'spatial_rotation': 'spatial',
                    'mental_rotation': 'spatial',
                    'spatial_navigation': 'spatial',
                    'block_design': 'spatial',
                    # Creativity exercises
                    'creative_thinking': 'creativity',
                    'divergent_thinking': 'creativity',
                    'idea_generation': 'creativity',
                    'creative_problem_solving': 'creativity',
                    'alternative_uses': 'creativity',
                    'musical_creativity': 'creativity',
                    'story_creation': 'creativity',
                    # General exercises
                    'general_cognitive': 'general',
                    'cognitive_assessment': 'general',
                    'brain_training': 'general',
                    'mindful_breathing': 'general',
                    'cognitive_warm_up': 'general',
                    'mental_flexibility': 'general',
                    # Perception exercises
                    'focused_attention': 'perception',
                    'pattern_recognition': 'perception',
                    'visual_perception': 'perception'
                }
                
                area_exercises = defaultdict(list)
                
                for result in exercise_results:
                    exercise_id = result.get('exerciseId', 'unknown')
                    exercise_type = result.get('exerciseType', 'unknown')
                    score = result.get('score', 0)
                    time_spent = result.get('timeSpent', 0)
                    
                    # Map to focus area
                    focus_area = exercise_to_area_map.get(exercise_id, 'unknown')
                    area_exercises[focus_area].append({
                        'id': exercise_id,
                        'type': exercise_type,
                        'score': score,
                        'time': time_spent
                    })
                    
                    print(f"    - {exercise_id} ({exercise_type}) -> {focus_area}: {score}% ({time_spent}s)")
                
                print(f"\n  📈 Focus Area Summary:")
                for area, exercises in area_exercises.items():
                    avg_score = sum(ex['score'] for ex in exercises) / len(exercises)
                    print(f"    - {area}: {len(exercises)} exercises, avg {avg_score:.1f}%")
        
        # Check cached progress
        if 'cached_progress' in user:
            cached = user['cached_progress']
            print(f"\n🗄️ Cached Progress:")
            print(f"  Improvement Areas: {cached.get('improvement_areas', [])}")
            print(f"  Strengths: {cached.get('strengths', [])}")
            print(f"  Overall Average: {cached.get('overall_average_score', 0):.2f}%")
            print(f"  Last Updated: {cached.get('last_updated')}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(check_mbuser2_detailed())