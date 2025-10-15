#!/usr/bin/env python3

"""
Test script to verify the priority areas logic works correctly.
This simulates the scenario where mbuser1 completed executive function 
in the first round, but then gets presented with another executive function 
activity in the subsequent round.
"""

import sys
import os
sys.path.append('./backend')

from training.logic import select_exercises

def test_priority_areas_logic():
    print("🧪 Testing Priority Areas Logic")
    print("=" * 50)
    
    # Scenario 1: Initial session - no priority areas
    print("\n📋 Scenario 1: Initial session (no priority areas)")
    focus_areas = ['memory', 'attention', 'executive']
    mood = 'focused'
    priority_areas = None
    session_duration = 0.0
    
    exercises = select_exercises(focus_areas, mood, priority_areas, session_duration)
    print(f"Focus areas: {focus_areas}")
    print(f"Priority areas: {priority_areas}")
    print(f"Session duration: {session_duration} minutes")
    print(f"Selected exercises: {[ex['id'] for ex in exercises]}")
    print(f"Exercise areas: {[ex['type'] for ex in exercises]}")
    
    # Scenario 2: Subsequent round - executive completed, memory and attention pending
    print("\n📋 Scenario 2: Subsequent round (executive completed)")
    focus_areas = ['memory', 'attention', 'executive']
    mood = 'focused'
    priority_areas = ['memory', 'attention']  # executive was completed
    session_duration = 3.5  # 3.5 minutes elapsed
    
    exercises = select_exercises(focus_areas, mood, priority_areas, session_duration)
    print(f"Focus areas: {focus_areas}")
    print(f"Priority areas (yet to practice): {priority_areas}")
    print(f"Session duration: {session_duration} minutes")
    print(f"Selected exercises: {[ex['id'] for ex in exercises]}")
    print(f"Exercise areas: {[ex['type'] for ex in exercises]}")
    
    # Check if executive function exercises are excluded
    executive_exercises = [ex for ex in exercises if ex['type'] == 'executive']
    if len(executive_exercises) == 0:
        print("✅ SUCCESS: No executive function exercises selected (correctly excluded)")
    else:
        print("❌ FAILURE: Executive function exercises still selected:", [ex['id'] for ex in executive_exercises])
    
    # Scenario 3: All areas completed, but session < 10 minutes
    print("\n📋 Scenario 3: All areas completed, session < 10 minutes")
    focus_areas = ['memory', 'attention', 'executive']
    mood = 'focused'
    priority_areas = []  # All areas completed
    session_duration = 7.0  # 7 minutes elapsed, still under 10 minute limit
    
    exercises = select_exercises(focus_areas, mood, priority_areas, session_duration)
    print(f"Focus areas: {focus_areas}")
    print(f"Priority areas (yet to practice): {priority_areas}")
    print(f"Session duration: {session_duration} minutes")
    print(f"Selected exercises: {[ex['id'] for ex in exercises]}")
    print(f"Exercise areas: {[ex['type'] for ex in exercises]}")
    
    if len(exercises) > 0:
        print("✅ SUCCESS: Exercises selected to fill remaining time (session < 10 min)")
    else:
        print("❌ FAILURE: No exercises selected despite having time remaining")
    
    # Scenario 4: Session reached 10 minute limit
    print("\n📋 Scenario 4: Session reached 10 minute limit")
    focus_areas = ['memory', 'attention', 'executive']
    mood = 'focused'
    priority_areas = []  # All areas completed
    session_duration = 10.0  # Exactly 10 minutes
    
    exercises = select_exercises(focus_areas, mood, priority_areas, session_duration)
    print(f"Focus areas: {focus_areas}")
    print(f"Priority areas (yet to practice): {priority_areas}")
    print(f"Session duration: {session_duration} minutes")
    print(f"Selected exercises: {[ex['id'] for ex in exercises]}")
    
    if len(exercises) == 0:
        print("✅ SUCCESS: No exercises selected (session duration limit reached)")
    else:
        print("❌ FAILURE: Exercises selected despite reaching time limit")

if __name__ == "__main__":
    test_priority_areas_logic()