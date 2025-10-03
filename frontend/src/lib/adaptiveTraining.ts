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
    memory: ['memory', 'mindful-memory'],
    attention: ['attention'],
    language: ['language', 'conversation'],
    executive: ['sequencing'],
    creativity: ['mindful-memory'],
    processing: ['attention'],
    spatial: ['memory'],
    general: ['memory', 'attention', 'language']
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
  
  // First priority: retry exercises with poor performance
  retryExercises.forEach(exerciseId => {
    if (selectedExercises.length < 3 && availableExercises.includes(exerciseId)) {
      selectedExercises.push(exerciseId);
    }
  });
  
  // Second priority: new exercises from focus areas
  const uniqueAvailable = [...new Set(availableExercises)];
  uniqueAvailable.forEach(exerciseId => {
    if (selectedExercises.length < 3 && 
        !selectedExercises.includes(exerciseId) && 
        !recentExercises.includes(exerciseId)) {
      selectedExercises.push(exerciseId);
    }
  });
  
  // Fill remaining slots with any available exercises
  uniqueAvailable.forEach(exerciseId => {
    if (selectedExercises.length < 3 && !selectedExercises.includes(exerciseId)) {
      selectedExercises.push(exerciseId);
    }
  });
  
  // Ensure we have exactly 3 exercises
  while (selectedExercises.length < 3) {
    const fallback = ['memory', 'attention', 'language'];
    selectedExercises.push(fallback[selectedExercises.length]);
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