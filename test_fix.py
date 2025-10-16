#!/usr/bin/env python3
"""
Test script to verify the progress logic fix is working correctly.
This simulates the scenario where mbuser1 completed 3 activities with decent scores.
"""

import sys
import os
sys.path.append('./backend')

# Mock the FocusAreaAnalytics class since we can't import it easily
class MockFocusAreaAnalytics:
    def __init__(self, area_name, current_score, improvement_status, sessions_count, average_score, best_score, trend_data):
        self.area_name = area_name
        self.current_score = current_score
        self.improvement_status = improvement_status
        self.sessions_count = sessions_count
        self.average_score = average_score
        self.best_score = best_score
        self.trend_data = trend_data

def _analyze_performance_patterns_fixed(focus_areas_analytics):
    """Fixed version of the progress analysis function"""
    
    improvement_areas = []
    strengths = []
    
    for analytics in focus_areas_analytics:
        # Normalize scores to handle both percentage (0-100) and decimal (0.0-1.0) formats
        # If score is > 1.0, assume it's a percentage and convert to decimal
        current_score = analytics.current_score / 100.0 if analytics.current_score > 1.0 else analytics.current_score
        average_score = analytics.average_score / 100.0 if analytics.average_score > 1.0 else analytics.average_score
        
        # Prioritize high performance - if current or average score is high, it's a strength
        is_high_performer = (current_score >= 0.8 or average_score >= 0.75)
        is_excellent_performer = (current_score >= 0.95 or average_score >= 0.9)
        
        # Excellent performers (95%+ scores) are always strengths, regardless of trend
        if is_excellent_performer:
            strengths.append(analytics.area_name)
        # High performers are strengths unless clearly declining with low recent scores
        elif is_high_performer:
            # Only consider it an improvement area if it's declining AND recent score is below 70%
            if analytics.improvement_status == "declining" and current_score < 0.7:
                improvement_areas.append(analytics.area_name)
            else:
                strengths.append(analytics.area_name)
        # Low performers need improvement
        elif (analytics.improvement_status == "declining" or
              current_score < 0.6 or  # Below 60% threshold
              average_score < 0.65):  # Below 65% average threshold
            improvement_areas.append(analytics.area_name)
        # Areas that are improving from low scores
        elif analytics.improvement_status == "improving":
            strengths.append(analytics.area_name)
    
    return improvement_areas, strengths

def _analyze_performance_patterns_old(focus_areas_analytics):
    """Old version of the progress analysis function (with the bug)"""
    
    improvement_areas = []
    strengths = []
    
    for analytics in focus_areas_analytics:
        # BUG: This doesn't handle percentage scores correctly
        # It treats 75.0 (75%) as if it's 7500% because it compares directly to 0.8
        is_high_performer = (analytics.current_score >= 0.8 or analytics.average_score >= 0.75)
        is_excellent_performer = (analytics.current_score >= 0.95 or analytics.average_score >= 0.9)
        
        # This would incorrectly categorize 75% as "excellent" because 75.0 >= 0.95
        if is_excellent_performer:
            strengths.append(analytics.area_name)
        elif is_high_performer:
            if analytics.improvement_status == "declining" and analytics.current_score < 0.7:
                improvement_areas.append(analytics.area_name)
            else:
                strengths.append(analytics.area_name)
        elif (analytics.improvement_status == "declining" or
              analytics.current_score < 0.6 or
              analytics.average_score < 0.65):
            improvement_areas.append(analytics.area_name)
        elif analytics.improvement_status == "improving":
            strengths.append(analytics.area_name)
    
    return improvement_areas, strengths

def main():
    print("🧪 Testing Progress Logic Fix")
    print("=" * 50)
    
    # Create mock analytics data that simulates mbuser1's scenario
    # User completed 3 activities with decent scores (75%, 82%, 68%)
    mock_analytics = [
        MockFocusAreaAnalytics(
            area_name='memory',
            current_score=75.0,  # 75% - should be a strength
            improvement_status='stable',
            sessions_count=2,
            average_score=78.0,  # 78% average
            best_score=85.0,
            trend_data=[]
        ),
        MockFocusAreaAnalytics(
            area_name='attention', 
            current_score=82.0,  # 82% - should be a strength
            improvement_status='improving',
            sessions_count=2,
            average_score=80.0,
            best_score=85.0,
            trend_data=[]
        ),
        MockFocusAreaAnalytics(
            area_name='language',
            current_score=68.0,  # 68% - should be a strength
            improvement_status='stable',
            sessions_count=1,
            average_score=68.0,
            best_score=68.0,
            trend_data=[]
        )
    ]
    
    print("📊 Mock user data (simulating mbuser1 who completed 3 activities):")
    for analytics in mock_analytics:
        print(f"  - {analytics.area_name}: current={analytics.current_score}%, average={analytics.average_score}%")
    
    print("\n🐛 Testing OLD logic (with bug):")
    old_improvement, old_strengths = _analyze_performance_patterns_old(mock_analytics)
    print(f"  📈 Strengths: {old_strengths}")
    print(f"  📉 Areas Needing Improvement: {old_improvement}")
    
    print("\n✅ Testing FIXED logic:")
    new_improvement, new_strengths = _analyze_performance_patterns_fixed(mock_analytics)
    print(f"  📈 Strengths: {new_strengths}")
    print(f"  📉 Areas Needing Improvement: {new_improvement}")
    
    print("\n🎯 Analysis:")
    print("  Expected: All 3 areas should be strengths (decent scores)")
    
    if len(new_strengths) == 3 and len(new_improvement) == 0:
        print("  🎉 SUCCESS: Fix is working correctly!")
        print("     - Areas are now correctly categorized as 'Your Strengths'")
        print("     - No longer incorrectly showing as 'Areas Needing Improvement'")
    else:
        print("  ❌ Issue still exists - fix may need adjustment")
    
    print("\n📝 Summary:")
    print("  The bug was caused by comparing percentage scores (0-100) against")
    print("  decimal thresholds (0.0-1.0). The fix normalizes scores before comparison.")

if __name__ == "__main__":
    main()