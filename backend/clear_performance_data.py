#!/usr/bin/env python3
"""
Performance data cleanup script for MindBloom application.
This script will clear only performance analytics data while preserving user accounts.
"""

import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def clear_performance_data():
    """Clear only performance analytics data from the MongoDB database."""
    
    # Get MongoDB connection string
    mongodb_uri = os.getenv("MONGODB_URI")
    if not mongodb_uri:
        print("❌ Error: MONGODB_URI not found in environment variables")
        return False
    
    try:
        # Connect to MongoDB
        print("🔌 Connecting to MongoDB...")
        client = AsyncIOMotorClient(mongodb_uri)
        db = client.mindbloom  # Database name from main.py
        
        # Test connection
        await client.admin.command('ping')
        print("✅ Connected to MongoDB successfully")
        
        # Collections that contain performance data (not user accounts)
        performance_collections = [
            'training_sessions',  # Training session data
            'progress',          # Progress tracking data
            'memory_notes',      # Memory notes from sessions
        ]
        
        # Fields to reset in users collection (keep user account but reset performance stats)
        user_performance_fields = {
            'streak': 0,
            'totalSessions': 0
        }
        
        total_deleted = 0
        
        # Clear performance collections completely
        for collection_name in performance_collections:
            collection = db[collection_name]
            
            # Count documents before deletion
            count_before = await collection.count_documents({})
            
            if count_before > 0:
                # Delete all documents in the collection
                result = await collection.delete_many({})
                deleted_count = result.deleted_count
                total_deleted += deleted_count
                
                print(f"🗑️  Cleared collection '{collection_name}': {deleted_count} documents deleted")
            else:
                print(f"ℹ️  Collection '{collection_name}' was already empty")
        
        # Reset performance fields in users collection (keep accounts but reset stats)
        users_collection = db['users']
        users_count = await users_collection.count_documents({})
        
        if users_count > 0:
            # Update all users to reset their performance stats
            result = await users_collection.update_many(
                {},  # Match all users
                {'$set': user_performance_fields}
            )
            print(f"🔄 Reset performance stats for {result.modified_count} users (streak and totalSessions set to 0)")
        else:
            print("ℹ️  No users found to reset performance stats")
        
        print(f"\n✅ Performance data cleanup completed!")
        print(f"📊 Total performance documents deleted: {total_deleted}")
        print(f"👥 User accounts preserved: {users_count}")
        
        # Close connection
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ Error during performance data cleanup: {str(e)}")
        return False

async def main():
    """Main function to run the performance data cleanup."""
    print("🧹 MindBloom Performance Data Cleanup Tool")
    print("=" * 50)
    print("This will clear performance analytics while preserving user accounts.")
    
    # Confirm with user
    confirm = input("⚠️  Clear all performance data but keep user accounts? (yes/no): ")
    if confirm.lower() not in ['yes', 'y']:
        print("❌ Operation cancelled by user")
        return
    
    # Run cleanup
    success = await clear_performance_data()
    
    if success:
        print("\n🎉 Performance data cleanup completed successfully!")
        print("💡 User accounts are preserved but all performance analytics have been reset.")
    else:
        print("\n❌ Performance data cleanup failed. Please check the error messages above.")

if __name__ == "__main__":
    asyncio.run(main())