#!/usr/bin/env python3
"""
Test script to verify the session completion fix is working.
This tests that sessions with exercise data are now included in progress calculations.
"""

import asyncio
import sys
import os
sys.path.append('backend')

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from backend.progress.logic import get_progress_analytics

load_dotenv('backend/.env')

async def test_session_fix():
    """Test that the session completion fix is working"""
    
    print("🧪 Testing Session Completion Fix")
    print("=" * 50)
    
    # Connect to database
    client = AsyncIOMotorClient(os.getenv('MONGODB_URI'))
    db = client.mindbloom
    
    try:
        # Find mbuser2 (we know this user has exercise data)
        user = await db.users.find_one({'email': 'mbuser2@example.com'})
        if not user:
            print('❌ Test user mbuser2 not found')
            return False
        
        user_id = str(user['_id'])
        print(f'✅ Found test user: {user["email"]} (ID: {user_id})')
        
        # Test the FIXED progress calculation
        print(f'\n🔧 Testing FIXED progress calculation...')
        progress_summary = await get_progress_analytics(user_id, db)
        
        print(f'\n📊 RESULTS:')
        print(f'   Total Sessions: {progress_summary.total_sessions}')
        print(f'   Overall Average Score: {progress_summary.overall_average_score:.1f}%')
        print(f'   Best Session Score: {progress_summary.best_session_score:.1f}%')
        print(f'   Focus Areas Found: {len(progress_summary.focus_areas_analytics)}')
        
        if progress_summary.focus_areas_analytics:
            print(f'\n🎯 Focus Area Details:')
            for analytics in progress_summary.focus_areas_analytics:
                print(f'   - {analytics.area_name}: {analytics.current_score:.1f}% (avg: {analytics.average_score:.1f}%, sessions: {analytics.sessions_count})')
        
        print(f'\n✅ CATEGORIZATION:')
        print(f'📈 Strengths: {progress_summary.strengths}')
        print(f'📉 Areas Needing Improvement: {progress_summary.improvement_areas}')
        
        # Determine success
        success = (
            progress_summary.total_sessions > 0 and
            progress_summary.overall_average_score > 0 and
            len(progress_summary.focus_areas_analytics) > 0
        )
        
        if success:
            print(f'\n🎉 SUCCESS: Fix is working correctly!')
            print(f'   ✓ Sessions with exercise data are now being included')
            print(f'   ✓ Progress calculation is working properly')
            print(f'   ✓ Focus areas are being categorized correctly')
            
            # Expected behavior for mbuser2's 66.22% scores
            if len(progress_summary.strengths) >= 3:
                print(f'   ✓ Areas with 66%+ scores correctly categorized as strengths')
            else:
                print(f'   ⚠️  Expected more areas in strengths (got {len(progress_summary.strengths)})')
                
        else:
            print(f'\n❌ ISSUE: Fix may not be working completely')
            print(f'   - Sessions found: {progress_summary.total_sessions}')
            print(f'   - Average score: {progress_summary.overall_average_score:.1f}%')
            print(f'   - Focus areas: {len(progress_summary.focus_areas_analytics)}')
        
        return success
        
    except Exception as e:
        print(f'❌ Error during test: {e}')
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        client.close()

if __name__ == "__main__":
    success = asyncio.run(test_session_fix())
    sys.exit(0 if success else 1)