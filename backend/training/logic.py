import random
from typing import List

def select_exercises(focus_areas: List[str], mood: str) -> List[dict]:
    """
    Select 3-5 exercises based on user's focus areas and mood.
    
    Args:
        focus_areas: List of cognitive areas the user wants to focus on
        mood: User's current mood state
        
    Returns:
        List of exercise objects to be performed in the session
    """
    
    # Predefined exercise map with focus areas and mood considerations
    exercise_pool = {
        "memory": [
            {
                "id": "memory_sequence",
                "name": "Memory Sequence",
                "description": "Remember and recall sequences of items",
                "type": "memory",
                "difficulty": "medium",
                "estimatedTime": 180,  # seconds
                "instructions": "Watch the sequence and repeat it back"
            },
            {
                "id": "word_pairs",
                "name": "Word Pairs",
                "description": "Associate and remember word pairs",
                "type": "memory",
                "difficulty": "easy",
                "estimatedTime": 240,
                "instructions": "Learn the word pairs and recall them"
            },
            {
                "id": "visual_recall",
                "name": "Visual Recall",
                "description": "Remember visual patterns and locations",
                "type": "memory",
                "difficulty": "hard",
                "estimatedTime": 300,
                "instructions": "Study the pattern and recreate it"
            }
        ],
        "attention": [
            {
                "id": "focused_attention",
                "name": "Focused Attention",
                "description": "Maintain focus on specific targets",
                "type": "attention",
                "difficulty": "medium",
                "estimatedTime": 120,
                "instructions": "Click only on the target items"
            },
            {
                "id": "divided_attention",
                "name": "Divided Attention",
                "description": "Track multiple objects simultaneously",
                "type": "attention",
                "difficulty": "hard",
                "estimatedTime": 180,
                "instructions": "Keep track of all moving objects"
            },
            {
                "id": "sustained_attention",
                "name": "Sustained Attention",
                "description": "Maintain attention over extended periods",
                "type": "attention",
                "difficulty": "medium",
                "estimatedTime": 300,
                "instructions": "Stay focused and respond to targets"
            }
        ],
        "language": [
            {
                "id": "word_finding",
                "name": "Word Finding",
                "description": "Find words that match given criteria",
                "type": "language",
                "difficulty": "easy",
                "estimatedTime": 150,
                "instructions": "Find words that start with the given letter"
            },
            {
                "id": "sentence_completion",
                "name": "Sentence Completion",
                "description": "Complete sentences with appropriate words",
                "type": "language",
                "difficulty": "medium",
                "estimatedTime": 200,
                "instructions": "Choose the best word to complete each sentence"
            },
            {
                "id": "verbal_fluency",
                "name": "Verbal Fluency",
                "description": "Generate words in specific categories",
                "type": "language",
                "difficulty": "medium",
                "estimatedTime": 180,
                "instructions": "Name as many items as possible in the category"
            }
        ],
        "executive": [
            {
                "id": "planning_task",
                "name": "Planning Task",
                "description": "Plan and execute multi-step tasks",
                "type": "executive",
                "difficulty": "hard",
                "estimatedTime": 360,
                "instructions": "Plan the optimal sequence to complete the task"
            },
            {
                "id": "cognitive_flexibility",
                "name": "Cognitive Flexibility",
                "description": "Switch between different mental tasks",
                "type": "executive",
                "difficulty": "medium",
                "estimatedTime": 240,
                "instructions": "Switch between tasks based on the cue"
            },
            {
                "id": "inhibition_control",
                "name": "Inhibition Control",
                "description": "Resist automatic responses",
                "type": "executive",
                "difficulty": "medium",
                "estimatedTime": 180,
                "instructions": "Respond only when the condition is met"
            }
        ],
        "processing": [
            {
                "id": "speed_processing",
                "name": "Speed Processing",
                "description": "Process information quickly and accurately",
                "type": "processing",
                "difficulty": "medium",
                "estimatedTime": 120,
                "instructions": "Complete as many items as possible quickly"
            },
            {
                "id": "pattern_recognition",
                "name": "Pattern Recognition",
                "description": "Identify patterns in sequences",
                "type": "processing",
                "difficulty": "medium",
                "estimatedTime": 200,
                "instructions": "Find the pattern and predict the next item"
            }
        ]
    }
    
    # Mood-based difficulty adjustments
    mood_adjustments = {
        "energetic": {"prefer_difficulty": ["medium", "hard"], "max_exercises": 5},
        "calm": {"prefer_difficulty": ["easy", "medium"], "max_exercises": 4},
        "focused": {"prefer_difficulty": ["medium", "hard"], "max_exercises": 4},
        "tired": {"prefer_difficulty": ["easy"], "max_exercises": 3},
        "stressed": {"prefer_difficulty": ["easy", "medium"], "max_exercises": 3},
        "motivated": {"prefer_difficulty": ["medium", "hard"], "max_exercises": 5}
    }
    
    # Get mood preferences or use defaults
    mood_prefs = mood_adjustments.get(mood.lower(), {
        "prefer_difficulty": ["easy", "medium"], 
        "max_exercises": 4
    })
    
    # Collect exercises from selected focus areas
    available_exercises = []
    for area in focus_areas:
        if area.lower() in exercise_pool:
            available_exercises.extend(exercise_pool[area.lower()])
    
    # If no focus areas match, include a mix from all areas
    if not available_exercises:
        for exercises in exercise_pool.values():
            available_exercises.extend(exercises)
    
    # Filter by mood preferences
    preferred_exercises = [
        ex for ex in available_exercises 
        if ex["difficulty"] in mood_prefs["prefer_difficulty"]
    ]
    
    # If no preferred exercises, use all available
    if not preferred_exercises:
        preferred_exercises = available_exercises
    
    # Randomly select exercises (3-5 based on mood)
    num_exercises = min(
        mood_prefs["max_exercises"], 
        len(preferred_exercises),
        random.randint(3, mood_prefs["max_exercises"])
    )
    
    selected_exercises = random.sample(preferred_exercises, num_exercises)
    
    # Ensure we have at least 3 exercises
    if len(selected_exercises) < 3 and len(available_exercises) >= 3:
        # Add more exercises if needed
        remaining = [ex for ex in available_exercises if ex not in selected_exercises]
        additional_needed = 3 - len(selected_exercises)
        if remaining:
            selected_exercises.extend(
                random.sample(remaining, min(additional_needed, len(remaining)))
            )
    
    return selected_exercises