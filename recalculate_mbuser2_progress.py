import asyncio
import sys
import os
sys.path.append('./backend')

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from progress.logic import recalculate_user_progress

load_dotenv('./backend/.env')

async def recalculate_mbuser2():
    """Recalculate mbuser2's progress to update cached data"""
    
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
        
        # Recalculate progress
        print("🔄 Recalculating progress...")
        progress_data = await recalculate_user_progress(user_id, db)
        
        print(f"✅ Progress recalculated successfully!")
        print(f"📈 Strengths: {progress_data.get('strengths', [])}")
        print(f"📉 Improvement Areas: {progress_data.get('improvement_areas', [])}")
        print(f"📊 Overall Average Score: {progress_data.get('overall_average_score', 0):.2f}%")
        print(f"🎯 Total Sessions: {progress_data.get('total_sessions', 0)}")
        
        # Verify the cached data was updated
        updated_user = await db.users.find_one({'_id': user['_id']})
        if updated_user and 'cached_progress' in updated_user:
            cached = updated_user['cached_progress']
            print(f"\n🗄️ Cached Progress Updated:")
            print(f"  Improvement Areas: {cached.get('improvement_areas', [])}")
            print(f"  Strengths: {cached.get('strengths', [])}")
            print(f"  Last Updated: {cached.get('last_updated')}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(recalculate_mbuser2())