import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from progress.logic import get_progress_analytics, _analyze_performance_patterns
import json

# Load environment variables
load_dotenv()

async def debug_user_progress():
    """Debug progress calculation for a specific user"""
    
    # Connect to MongoDB
    mongodb_uri = os.getenv("MONGODB_URI")
    client = AsyncIOMotorClient(mongodb_uri)
    db = client.mindbloom
    
    try:
        # Find a user with completed sessions
        users_cursor = db.users.find({})
        async for user in users_cursor:
            user_id = str(user["_id"])
            
            # Check if user has completed sessions
            session_count = await db.training_sessions.count_documents({
                "userId": user_id,
                "isComplete": True
            })
            
            if session_count > 0:
                print(f"\n=== DEBUGGING USER: {user.get('name', 'Unknown')} ({user.get('email', 'No email')}) ===")
                print(f"User ID: {user_id}")
                print(f"Completed Sessions: {session_count}")
                
                # Get their training sessions
                sessions_cursor = db.training_sessions.find({
                    "userId": user_id,
                    "isComplete": True
                }).sort("createdAt", 1)
                
                sessions = []
                async for session in sessions_cursor:
                    sessions.append(session)
                
                print(f"\nSESSION DATA:")
                for i, session in enumerate(sessions):
                    print(f"  Session {i+1}:")
                    print(f"    Focus Areas: {session.get('focusAreas', [])}")
                    print(f"    Average Score: {session.get('averageScore', 'None')}")
                    print(f"    Exercise Results: {len(session.get('exerciseResults', []))} exercises")
                    
                    if session.get('exerciseResults'):
                        for j, result in enumerate(session['exerciseResults']):
                            print(f"      Exercise {j+1}: {result.get('exerciseId', 'unknown')} - Score: {result.get('score', 0)}")
                
                # Get progress analytics
                progress = await get_progress_analytics(user_id, db)
                
                print(f"\nPROGRESS ANALYTICS:")
                print(f"  Total Sessions: {progress.total_sessions}")
                print(f"  Overall Average Score: {progress.overall_average_score}")
                print(f"  Focus Areas Analytics:")
                
                for analytics in progress.focus_areas_analytics:
                    print(f"    {analytics.area_name}:")
                    print(f"      Current Score: {analytics.current_score}")
                    print(f"      Average Score: {analytics.average_score}")
                    print(f"      Best Score: {analytics.best_score}")
                    print(f"      Sessions Count: {analytics.sessions_count}")
                    print(f"      Improvement Status: {analytics.improvement_status}")
                
                print(f"\nCATEGORIZATION:")
                print(f"  Improvement Areas: {progress.improvement_areas}")
                print(f"  Strengths: {progress.strengths}")
                
                # Debug the categorization logic step by step
                print(f"\nDEBUGGING CATEGORIZATION LOGIC:")
                improvement_areas = []
                strengths = []
                
                for analytics in progress.focus_areas_analytics:
                    print(f"\n  Analyzing {analytics.area_name}:")
                    
                    is_high_performer = (analytics.current_score >= 0.8 or analytics.average_score >= 0.75)
                    is_excellent_performer = (analytics.current_score >= 0.95 or analytics.average_score >= 0.9)
                    
                    print(f"    Current Score: {analytics.current_score} (>= 0.8: {analytics.current_score >= 0.8})")
                    print(f"    Average Score: {analytics.average_score} (>= 0.75: {analytics.average_score >= 0.75})")
                    print(f"    Is High Performer: {is_high_performer}")
                    print(f"    Is Excellent Performer: {is_excellent_performer}")
                    print(f"    Improvement Status: {analytics.improvement_status}")
                    
                    if is_excellent_performer:
                        print(f"    -> EXCELLENT PERFORMER: Adding to strengths")
                        strengths.append(analytics.area_name)
                    elif is_high_performer:
                        if analytics.improvement_status == "declining" and analytics.current_score < 0.7:
                            print(f"    -> HIGH PERFORMER BUT DECLINING: Adding to improvement areas")
                            improvement_areas.append(analytics.area_name)
                        else:
                            print(f"    -> HIGH PERFORMER: Adding to strengths")
                            strengths.append(analytics.area_name)
                    elif (analytics.improvement_status == "declining" or 
                          analytics.current_score < 0.6 or
                          analytics.average_score < 0.65):
                        print(f"    -> LOW PERFORMER: Adding to improvement areas")
                        improvement_areas.append(analytics.area_name)
                    elif analytics.improvement_status == "improving":
                        print(f"    -> IMPROVING: Adding to strengths")
                        strengths.append(analytics.area_name)
                    else:
                        print(f"    -> NO CATEGORY MATCHED")
                
                print(f"\n  FINAL CATEGORIZATION:")
                print(f"    Improvement Areas: {improvement_areas}")
                print(f"    Strengths: {strengths}")
                
                break  # Only debug the first user with sessions
        
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(debug_user_progress())