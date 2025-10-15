import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

async def debug_collections():
    # Connect to MongoDB
    mongodb_uri = os.getenv("MONGODB_URI")
    client = AsyncIOMotorClient(mongodb_uri)
    db = client.mindbloom
    
    print("🔍 DEBUGGING DATABASE COLLECTIONS")
    print("=" * 50)
    
    # List all collections
    collections = await db.list_collection_names()
    print(f"Collections in database: {collections}")
    
    # Find Radhika's user record
    user = await db.users.find_one({"email": "rmsatapathy@yahoo.com"})
    if not user:
        print("❌ User rmsatapathy@yahoo.com not found")
        return
    
    user_id = user["_id"]
    print(f"\n👤 Found user: {user['name']} ({user['email']})")
    print(f"   User ID: {user_id}")
    print(f"   User ID type: {type(user_id)}")
    
    # Check each collection for this user
    for collection_name in collections:
        collection = db[collection_name]
        
        # Try different user_id field names and formats
        queries = [
            {"user_id": user_id},
            {"userId": user_id},
            {"user_id": str(user_id)},
            {"userId": str(user_id)},
        ]
        
        for query in queries:
            count = await collection.count_documents(query)
            if count > 0:
                print(f"\n📊 Collection '{collection_name}': {count} documents with query {query}")
                
                # Show a sample document
                sample = await collection.find_one(query)
                if sample:
                    print(f"   Sample document keys: {list(sample.keys())}")
                    if "exercise_results" in sample:
                        print(f"   Exercise results: {len(sample['exercise_results']) if sample['exercise_results'] else 0} exercises")
                        if sample['exercise_results']:
                            for i, result in enumerate(sample['exercise_results']):
                                exercise_id = result.get('exerciseId', 'unknown')
                                score = result.get('score', 'N/A')
                                print(f"     Exercise {i+1}: {exercise_id} (score: {score})")
                break
    
    client.close()

if __name__ == "__main__":
    asyncio.run(debug_collections())