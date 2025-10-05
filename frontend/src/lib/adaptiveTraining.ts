// Adaptive training system for MindBloom
export interface ExerciseResult {
  exerciseId: string;
  score: number;
  timeSpent: number;
  difficulty: number;
  date: string;
  skipped?: boolean;
}

export interface UserPerformance {
  exerciseHistory: Array<{
    date: string;
    exercises: ExerciseResult[];
    mood: string;
    focusAreas: string[];
  }>;
  exerciseStats: {
    [exerciseId: string]: {
      attempts: number;
      averageScore: number;
      lastScore: number;
      lastAttempt: string;
      needsRetry: boolean;
      currentDifficulty: number;
    };
  };
}

// Difficulty adjustment based on performance
export const calculateDifficulty = (exerciseId: string, userData: any): number => {
  const stats = userData.exerciseStats?.[exerciseId];
  
  if (!stats) {
    // First time - start with beginner difficulty
    return userData.experience === 'experienced' ? 2 : 
           userData.experience === 'some' ? 1.5 : 1;
  }
  
  const { averageScore, attempts, currentDifficulty } = stats;
  let newDifficulty = currentDifficulty || 1;
  
  // Adjust based on performance
  if (averageScore >= 85 && attempts >= 2) {
    newDifficulty = Math.min(3, newDifficulty + 0.5);
  } else if (averageScore >= 70 && attempts >= 3) {
    newDifficulty = Math.min(3, newDifficulty + 0.25);
  } else if (averageScore < 50 && attempts >= 2) {
    newDifficulty = Math.max(0.5, newDifficulty - 0.5);
  } else if (averageScore < 65 && attempts >= 3) {
    newDifficulty = Math.max(0.5, newDifficulty - 0.25);
  }
  
  return Math.round(newDifficulty * 2) / 2; // Round to nearest 0.5
};

// Select exercises with variety and retry logic
export const selectExercises = (focusAreas: string[], userData: any, mood: string): string[] => {
  const exerciseMap: { [key: string]: string[] } = {
    memory: ['memory', 'mindful-memory', 'visual-recall'],
    attention: ['attention', 'pattern-recognition', 'rapid-matching'],
    language: ['language', 'conversation', 'word-association'],
    executive: ['sequencing', 'logic-puzzle'],
    creativity: ['mindful-memory', 'story-creation'], // mindful-memory can also be creative
    processing: ['attention', 'rapid-matching'], // attention for focus, rapid-matching for speed
    spatial: ['memory', 'spatial-puzzle'], // memory for visual recall, spatial-puzzle for reasoning
    general: ['memory', 'attention', 'language', 'sequencing', 'mindful-memory', 'conversation', 'visual-recall', 'pattern-recognition', 'word-association', 'logic-puzzle', 'story-creation', 'rapid-matching', 'spatial-puzzle']
  };
  
  const availableExercises: string[] = [];
  const retryExercises: string[] = [];
  
  // Get exercises for focus areas
  focusAreas.forEach(area => {
    const areaExercises = exerciseMap[area] || exerciseMap.general;
    availableExercises.push(...areaExercises);
  });
  
  // Check for exercises that need retry (poor performance)
  const exerciseStats = userData.exerciseStats || {};
  Object.keys(exerciseStats).forEach(exerciseId => {
    const stats = exerciseStats[exerciseId];
    if (stats.needsRetry || stats.lastScore < 60) {
      retryExercises.push(exerciseId);
    }
  });
  
  // Get recent exercises to avoid repetition
  const recentExercises = getRecentExercises(userData, 3); // Last 3 sessions
  
  let selectedExercises: string[] = [];
  
  // 1. Prioritize retry exercises with poor performance
  const shuffledRetry = [...retryExercises].sort(() => Math.random() - 0.5); // Shuffle retry exercises
  shuffledRetry.forEach(exerciseId => {
    if (selectedExercises.length < 3 && availableExercises.includes(exerciseId)) {
      selectedExercises.push(exerciseId);
    }
  });
  
  // 2. Add exercises from focus areas, avoiding recent and already selected ones
  let potentialNewExercises = [...new Set(availableExercises)].filter(
    (id) => !selectedExercises.includes(id) && !recentExercises.includes(id)
  );
  potentialNewExercises = potentialNewExercises.sort(() => Math.random() - 0.5); // Shuffle for variety

  potentialNewExercises.forEach(exerciseId => {
    if (selectedExercises.length < 3) {
      selectedExercises.push(exerciseId);
    }
  });
  
  // 3. Fill any remaining slots with other available exercises, ensuring variety
  if (selectedExercises.length < 3) {
    let fallbackPool = [...new Set(availableExercises)].filter(
      (id) => !selectedExercises.includes(id)
    );
    fallbackPool = fallbackPool.sort(() => Math.random() - 0.5); // Shuffle fallback pool

    fallbackPool.forEach(exerciseId => {
      if (selectedExercises.length < 3) {
        selectedExercises.push(exerciseId);
      }
    });
  }
  
  // Ensure we have exactly 3 exercises, using a general fallback if necessary
  while (selectedExercises.length < 3) {
    const generalFallback = exerciseMap.general; // Use the expanded general pool
    const randomFallback = generalFallback[Math.floor(Math.random() * generalFallback.length)];
    if (!selectedExercises.includes(randomFallback)) {
      selectedExercises.push(randomFallback);
    } else {
      // If the random fallback is already selected, try another random one
      // This loop ensures we eventually find a unique one if possible
      let uniqueFound = false;
      for (let i = 0; i < generalFallback.length; i++) {
        const alternativeFallback = generalFallback[(Math.floor(Math.random() * generalFallback.length) + i) % generalFallback.length];
        if (!selectedExercises.includes(alternativeFallback)) {
          selectedExercises.push(alternativeFallback);
          uniqueFound = true;
          break;
        }
      }
      if (!uniqueFound) {
        // Fallback to just adding a duplicate if no unique options left (shouldn't happen with a decent pool)
        selectedExercises.push(generalFallback[0]);
      }
    }
  }
  
  return selectedExercises.slice(0, 3);
};

// Get recent exercises to avoid repetition
const getRecentExercises = (userData: any, sessionCount: number): string[] => {
  const exerciseHistory = userData.exerciseHistory || [];
  const recentSessions = exerciseHistory.slice(-sessionCount);
  const recentExercises: string[] = [];
  
  recentSessions.forEach((session: any) => {
    session.exercises?.forEach((exercise: any) => {
      if (!exercise.skipped && exercise.score >= 60) {
        recentExercises.push(exercise.exerciseId);
      }
    });
  });
  
  return [...new Set(recentExercises)];
};

// Update exercise statistics after completion
export const updateExerciseStats = (userData: any, result: ExerciseResult): any => {
  const exerciseStats = userData.exerciseStats || {};
  const exerciseId = result.exerciseId;
  
  if (!exerciseStats[exerciseId]) {
    exerciseStats[exerciseId] = {
      attempts: 0,
      averageScore: 0,
      lastScore: 0,
      lastAttempt: '',
      needsRetry: false,
      currentDifficulty: 1
    };
  }
  
  const stats = exerciseStats[exerciseId];
  stats.attempts += 1;
  stats.lastScore = result.score;
  stats.lastAttempt = result.date;
  stats.needsRetry = result.score < 60;
  stats.currentDifficulty = result.difficulty;
  
  // Update average score
  const previousTotal = stats.averageScore * (stats.attempts - 1);
  stats.averageScore = Math.round((previousTotal + result.score) / stats.attempts);
  
  return {
    ...userData,
    exerciseStats
  };
};

// Mood-based difficulty adjustment
export const adjustForMood = (baseDifficulty: number, mood: string): number => {
  const moodAdjustments = {
    'motivated': 0.25,
    'okay': 0,
    'foggy': -0.25,
    'tired': -0.5,
    'stressed': -0.5
  };
  
  const adjustment = moodAdjustments[mood as keyof typeof moodAdjustments] || 0;
  return Math.max(0.5, Math.min(3, baseDifficulty + adjustment));
};