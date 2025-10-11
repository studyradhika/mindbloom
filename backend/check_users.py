import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def check_users():
    """Check what users exist in the database"""
    mongodb_uri = os.getenv("MONGODB_URI")
    if not mongodb_uri:
        print("❌ No MONGODB_URI found in environment")
        return
    
    client = AsyncIOMotorClient(mongodb_uri)
    db = client.mindbloom
    
    try:
        # Count total users
        user_count = await db.users.count_documents({})
        print(f"📊 Total users in database: {user_count}")
        
        if user_count > 0:
            print("\n👥 Users found:")
            async for user in db.users.find({}, {"email": 1, "name": 1, "createdAt": 1}):
                print(f"  - Email: {user.get('email', 'N/A')}")
                print(f"    Name: {user.get('name', 'N/A')}")
                print(f"    Created: {user.get('createdAt', 'N/A')}")
                print(f"    ID: {user.get('_id', 'N/A')}")
                print()
        else:
            print("❌ No users found in database")
            
    except Exception as e:
        print(f"❌ Error checking database: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(check_users())