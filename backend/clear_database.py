#!/usr/bin/env python3
"""
Database cleanup script for MindBloom application.
This script will clear all user data from the MongoDB database.
"""

import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def clear_database():
    """Clear all user data from the MongoDB database."""
    
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
        
        # Get all collections
        collections = await db.list_collection_names()
        print(f"📋 Found collections: {collections}")
        
        if not collections:
            print("ℹ️  No collections found - database is already empty")
            return True
        
        # Clear each collection
        total_deleted = 0
        for collection_name in collections:
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
        
        print(f"\n✅ Database cleanup completed!")
        print(f"📊 Total documents deleted: {total_deleted}")
        
        # Close connection
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ Error during database cleanup: {str(e)}")
        return False

async def main():
    """Main function to run the database cleanup."""
    print("🧹 MindBloom Database Cleanup Tool")
    print("=" * 40)
    
    # Confirm with user
    confirm = input("⚠️  This will DELETE ALL user data from the database. Are you sure? (yes/no): ")
    if confirm.lower() not in ['yes', 'y']:
        print("❌ Operation cancelled by user")
        return
    
    # Run cleanup
    success = await clear_database()
    
    if success:
        print("\n🎉 Database cleanup completed successfully!")
        print("💡 You can now create fresh users without any existing data conflicts.")
    else:
        print("\n❌ Database cleanup failed. Please check the error messages above.")

if __name__ == "__main__":
    asyncio.run(main())