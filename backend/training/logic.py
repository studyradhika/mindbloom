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
        ],
        "perception": [
            {
                "id": "visual_perception",
                "name": "Visual Perception",
                "description": "Identify and distinguish visual elements",
                "type": "perception",
                "difficulty": "medium",
                "estimatedTime": 150,
                "instructions": "Identify the different visual elements"
            },
            {
                "id": "spatial_awareness",
                "name": "Spatial Awareness",
                "description": "Understand spatial relationships",
                "type": "perception",
                "difficulty": "medium",
                "estimatedTime": 180,
                "instructions": "Determine spatial positions and relationships"
            },
            {
                "id": "object_recognition",
                "name": "Object Recognition",
                "description": "Recognize and categorize objects",
                "type": "perception",
                "difficulty": "easy",
                "estimatedTime": 120,
                "instructions": "Identify and categorize the objects shown"
            }
        ],
        "general": [
            {
                "id": "mindful_breathing",
                "name": "Mindful Breathing",
                "description": "Practice focused breathing for mental clarity",
                "type": "general",
                "difficulty": "easy",
                "estimatedTime": 180,
                "instructions": "Follow the breathing pattern to center your mind"
            },
            {
                "id": "cognitive_warm_up",
                "name": "Cognitive Warm-up",
                "description": "General mental preparation exercises",
                "type": "general",
                "difficulty": "easy",
                "estimatedTime": 120,
                "instructions": "Complete these warm-up exercises to prepare your mind"
            },
            {
                "id": "mental_flexibility",
                "name": "Mental Flexibility",
                "description": "Adapt thinking patterns and approaches",
                "type": "general",
                "difficulty": "medium",
                "estimatedTime": 200,
                "instructions": "Switch between different thinking approaches"
            }
        ],
        "spatial": [
            {
                "id": "3d_rotation",
                "name": "3D Rotation Puzzle",
                "description": "Rotate 3D objects to match target orientations",
                "type": "spatial",
                "difficulty": "medium",
                "estimatedTime": 240,
                "instructions": "Rotate the 3D object to match the target shape shown"
            },
            {
                "id": "mental_folding",
                "name": "Mental Paper Folding",
                "description": "Visualize paper folding and predict the result",
                "type": "spatial",
                "difficulty": "hard",
                "estimatedTime": 300,
                "instructions": "Imagine folding the paper as shown and predict where holes will appear"
            },
            {
                "id": "spatial_navigation",
                "name": "Spatial Navigation",
                "description": "Navigate through virtual mazes using spatial memory",
                "type": "spatial",
                "difficulty": "medium",
                "estimatedTime": 360,
                "instructions": "Find your way through the maze using spatial landmarks"
            },
            {
                "id": "block_design",
                "name": "Block Design Challenge",
                "description": "Arrange colored blocks to match target patterns",
                "type": "spatial",
                "difficulty": "medium",
                "estimatedTime": 240,
                "instructions": "Arrange the blocks to recreate the target design"
            },
            {
                "id": "perspective_taking",
                "name": "Perspective Taking",
                "description": "Determine how objects appear from different viewpoints",
                "type": "spatial",
                "difficulty": "hard",
                "estimatedTime": 180,
                "instructions": "Select how the scene would look from the indicated viewpoint"
            }
        ],
        "creativity": [
            {
                "id": "alternative_uses",
                "name": "Alternative Uses Challenge",
                "description": "Think of creative uses for everyday objects",
                "type": "creativity",
                "difficulty": "easy",
                "estimatedTime": 240,
                "instructions": "List as many creative uses as possible for the given object"
            },
            {
                "id": "story_building",
                "name": "Collaborative Story Building",
                "description": "Create imaginative stories from random prompts",
                "type": "creativity",
                "difficulty": "medium",
                "estimatedTime": 300,
                "instructions": "Build a creative story using the provided elements and prompts"
            },
            {
                "id": "visual_metaphors",
                "name": "Visual Metaphor Creation",
                "description": "Create visual representations of abstract concepts",
                "type": "creativity",
                "difficulty": "medium",
                "estimatedTime": 360,
                "instructions": "Design a visual metaphor that represents the given abstract concept"
            },
            {
                "id": "pattern_breaking",
                "name": "Pattern Breaking Exercise",
                "description": "Break conventional thinking patterns with creative solutions",
                "type": "creativity",
                "difficulty": "hard",
                "estimatedTime": 240,
                "instructions": "Find unconventional solutions that break typical thinking patterns"
            },
            {
                "id": "musical_creativity",
                "name": "Musical Pattern Creation",
                "description": "Create rhythmic and melodic patterns",
                "type": "creativity",
                "difficulty": "medium",
                "estimatedTime": 300,
                "instructions": "Compose simple musical patterns using the provided tools"
            },
            {
                "id": "perspective_shift",
                "name": "Perspective Shift Challenge",
                "description": "View problems from multiple creative perspectives",
                "type": "creativity",
                "difficulty": "medium",
                "estimatedTime": 180,
                "instructions": "Approach the challenge from at least three different creative perspectives"
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
    
    # NEW LOGIC: Select one exercise from each focus area
    selected_exercises = []
    
    # First, try to get one exercise from each selected focus area
    for area in focus_areas:
        area_key = area.lower()
        if area_key in exercise_pool:
            area_exercises = exercise_pool[area_key]
            
            # Filter by mood preferences for this area
            preferred_area_exercises = [
                ex for ex in area_exercises
                if ex["difficulty"] in mood_prefs["prefer_difficulty"]
            ]
            
            # If no preferred exercises in this area, use all from this area
            if not preferred_area_exercises:
                preferred_area_exercises = area_exercises
            
            # Randomly select one exercise from this area
            if preferred_area_exercises:
                selected_exercise = random.choice(preferred_area_exercises)
                selected_exercises.append(selected_exercise)
    
    # If we have fewer than 3 exercises, fill up to 3 with additional exercises
    if len(selected_exercises) < 3:
        # Collect all available exercises not already selected
        all_available = []
        for area_exercises in exercise_pool.values():
            all_available.extend(area_exercises)
        
        # Remove already selected exercises
        remaining_exercises = [
            ex for ex in all_available
            if ex not in selected_exercises
        ]
        
        # Filter by mood preferences
        preferred_remaining = [
            ex for ex in remaining_exercises
            if ex["difficulty"] in mood_prefs["prefer_difficulty"]
        ]
        
        if not preferred_remaining:
            preferred_remaining = remaining_exercises
        
        # Add additional exercises to reach minimum of 3
        additional_needed = 3 - len(selected_exercises)
        if preferred_remaining and additional_needed > 0:
            additional_exercises = random.sample(
                preferred_remaining,
                min(additional_needed, len(preferred_remaining))
            )
            selected_exercises.extend(additional_exercises)
    
    # If we still don't have enough exercises, add from any area
    if len(selected_exercises) < 3:
        all_exercises = []
        for exercises in exercise_pool.values():
            all_exercises.extend(exercises)
        
        remaining = [ex for ex in all_exercises if ex not in selected_exercises]
        additional_needed = 3 - len(selected_exercises)
        
        if remaining and additional_needed > 0:
            additional = random.sample(remaining, min(additional_needed, len(remaining)))
            selected_exercises.extend(additional)
    
    return selected_exercises