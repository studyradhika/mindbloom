// Enhanced adaptive training system that integrates with backend progress analytics
import { api } from './api';

export interface EnhancedUserPerformance {
  userId: string;
  focusAreaPerformance: {
    [areaName: string]: {
      currentScore: number;
      averageScore: number;
      improvementStatus: 'improving' | 'stable' | 'declining';
      sessionCount: number;
      lastSessionDate: string;
    };
  };
  exerciseHistory: {
    [exerciseId: string]: {
      attempts: number;
      averageScore: number;
      lastScore: number;
      currentDifficulty: number;
      lastAttempt: string;
      improvementTrend: 'improving' | 'stable' | 'declining';
    };
  };
  overallProgress: {
    strengths: string[];
    improvementAreas: string[];
    totalSessions: number;
    averageScore: number;
  };
}

export interface AdaptiveRecommendation {
  exerciseId: string;
  recommendedDifficulty: number;
  reasoning: string[];
  priority: 'high' | 'medium' | 'low';
  focusArea: string;
}

export class EnhancedAdaptiveTraining {
  private userPerformance: EnhancedUserPerformance | null = null;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Fetch comprehensive user performance data from backend
  async loadUserPerformance(): Promise<EnhancedUserPerformance> {
    try {
      // Get progress analytics from backend
      const progressResponse = await api.get(`/progress/${this.userId}`);
      const progressData = progressResponse.data;

      // Get training session history
      const historyResponse = await api.get(`/training/history/${this.userId}`);
      const sessionHistory = historyResponse.data;

      // Transform backend data into our enhanced format
      const focusAreaPerformance: { [key: string]: any } = {};
      
      progressData.focus_areas_analytics?.forEach((area: any) => {
        focusAreaPerformance[area.area_name] = {
          currentScore: area.current_score,
          averageScore: area.average_score,
          improvementStatus: area.improvement_status,
          sessionCount: area.session_count,
          lastSessionDate: area.last_session_date
        };
      });

      // Build exercise history from sessions
      const exerciseHistory: { [key: string]: any } = {};
      
      sessionHistory.forEach((session: any) => {
        session.exerciseResults?.forEach((result: any) => {
          const exerciseId = result.exerciseId;
          
          if (!exerciseHistory[exerciseId]) {
            exerciseHistory[exerciseId] = {
              attempts: 0,
              scores: [],
              difficulties: [],
              dates: []
            };
          }
          
          exerciseHistory[exerciseId].attempts++;
          exerciseHistory[exerciseId].scores.push(result.score || 0);
          exerciseHistory[exerciseId].difficulties.push(result.difficulty || 1);
          exerciseHistory[exerciseId].dates.push(session.completedAt);
        });
      });

      // Calculate exercise statistics
      Object.keys(exerciseHistory).forEach(exerciseId => {
        const history = exerciseHistory[exerciseId];
        const scores = history.scores;
        const difficulties = history.difficulties;
        
        history.averageScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
        history.lastScore = scores[scores.length - 1];
        history.currentDifficulty = difficulties[difficulties.length - 1];
        history.lastAttempt = history.dates[history.dates.length - 1];
        
        // Calculate improvement trend
        if (scores.length >= 3) {
          const recentScores = scores.slice(-3);
          const earlierScores = scores.slice(0, -3);
          const recentAvg = recentScores.reduce((a: number, b: number) => a + b, 0) / recentScores.length;
          const earlierAvg = earlierScores.reduce((a: number, b: number) => a + b, 0) / earlierScores.length;
          
          if (recentAvg > earlierAvg + 0.1) {
            history.improvementTrend = 'improving';
          } else if (recentAvg < earlierAvg - 0.1) {
            history.improvementTrend = 'declining';
          } else {
            history.improvementTrend = 'stable';
          }
        } else {
          history.improvementTrend = 'stable';
        }
        
        // Clean up temporary arrays
        delete history.scores;
        delete history.difficulties;
        delete history.dates;
      });

      this.userPerformance = {
        userId: this.userId,
        focusAreaPerformance,
        exerciseHistory,
        overallProgress: {
          strengths: progressData.strengths || [],
          improvementAreas: progressData.improvement_areas || [],
          totalSessions: sessionHistory.length,
          averageScore: progressData.overall_average_score || 0
        }
      };

      return this.userPerformance;
    } catch (error) {
      console.error('Failed to load user performance data:', error);
      // Fallback to basic performance data
      return this.createBasicPerformance();
    }
  }

  // Generate adaptive recommendations for exercises
  async getAdaptiveRecommendations(
    focusAreas: string[], 
    mood: string, 
    sessionType: 'practice' | 'challenge' | 'review' = 'practice'
  ): Promise<AdaptiveRecommendation[]> {
    
    if (!this.userPerformance) {
      await this.loadUserPerformance();
    }

    const recommendations: AdaptiveRecommendation[] = [];
    
    // Exercise to focus area mapping
    const exerciseToAreaMap: { [key: string]: string } = {
      'memory_sequence': 'memory',
      'word_pairs': 'memory',
      'visual_recall': 'memory',
      'working_memory': 'memory',
      'divided_attention': 'attention',
      'sustained_attention': 'attention',
      'selective_attention': 'attention',
      'focused_attention': 'perception',
      'pattern_recognition': 'perception',
      'visual_perception': 'perception',
      'word_finding': 'language',
      'sentence_completion': 'language',
      'verbal_fluency': 'language',
      'reading_comprehension': 'language',
      'planning_task': 'executive',
      'cognitive_flexibility': 'executive',
      'inhibition_control': 'executive',
      'task_switching': 'executive',
      'speed_processing': 'processing',
      'rapid_naming': 'processing',
      'symbol_coding': 'processing'
    };

    // Get available exercises for focus areas
    const availableExercises = Object.keys(exerciseToAreaMap).filter(
      exerciseId => focusAreas.includes(exerciseToAreaMap[exerciseId])
    );

    for (const exerciseId of availableExercises) {
      const focusArea = exerciseToAreaMap[exerciseId];
      const recommendation = this.calculateAdaptiveRecommendation(
        exerciseId, 
        focusArea, 
        mood, 
        sessionType
      );
      recommendations.push(recommendation);
    }

    // Sort by priority and focus area performance needs
    return recommendations.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private calculateAdaptiveRecommendation(
    exerciseId: string, 
    focusArea: string, 
    mood: string, 
    sessionType: string
  ): AdaptiveRecommendation {
    
    const exerciseHistory = this.userPerformance?.exerciseHistory[exerciseId];
    const areaPerformance = this.userPerformance?.focusAreaPerformance[focusArea];
    const isImprovementArea = this.userPerformance?.overallProgress.improvementAreas.includes(focusArea);
    
    let baseDifficulty = 1.0; // Default difficulty
    const reasoning: string[] = [];
    let priority: 'high' | 'medium' | 'low' = 'medium';

    // 1. Exercise-specific history
    if (exerciseHistory) {
      baseDifficulty = exerciseHistory.currentDifficulty;
      
      // Adjust based on recent performance
      if (exerciseHistory.lastScore >= 0.85) {
        baseDifficulty = Math.min(3.0, baseDifficulty + 0.5);
        reasoning.push(`Increased difficulty due to excellent recent performance (${Math.round(exerciseHistory.lastScore * 100)}%)`);
      } else if (exerciseHistory.lastScore >= 0.70) {
        baseDifficulty = Math.min(3.0, baseDifficulty + 0.25);
        reasoning.push(`Slightly increased difficulty due to good performance (${Math.round(exerciseHistory.lastScore * 100)}%)`);
      } else if (exerciseHistory.lastScore < 0.50) {
        baseDifficulty = Math.max(0.5, baseDifficulty - 0.5);
        reasoning.push(`Reduced difficulty due to challenging recent session (${Math.round(exerciseHistory.lastScore * 100)}%)`);
        priority = 'high'; // Prioritize struggling exercises
      } else if (exerciseHistory.lastScore < 0.65) {
        baseDifficulty = Math.max(0.5, baseDifficulty - 0.25);
        reasoning.push(`Slightly reduced difficulty due to below-average performance (${Math.round(exerciseHistory.lastScore * 100)}%)`);
      }

      // Consider improvement trend
      if (exerciseHistory.improvementTrend === 'improving') {
        baseDifficulty = Math.min(3.0, baseDifficulty + 0.25);
        reasoning.push('Increased difficulty due to improving trend');
      } else if (exerciseHistory.improvementTrend === 'declining') {
        baseDifficulty = Math.max(0.5, baseDifficulty - 0.25);
        reasoning.push('Reduced difficulty due to declining performance');
        priority = 'high';
      }
    } else {
      // First time doing this exercise
      reasoning.push('New exercise - starting with adaptive difficulty based on focus area performance');
    }

    // 2. Focus area performance
    if (areaPerformance) {
      if (areaPerformance.currentScore < 0.6) {
        baseDifficulty = Math.max(0.5, baseDifficulty - 0.25);
        reasoning.push(`Reduced difficulty due to low focus area performance (${Math.round(areaPerformance.currentScore * 100)}%)`);
        priority = 'high';
      } else if (areaPerformance.currentScore >= 0.8) {
        baseDifficulty = Math.min(3.0, baseDifficulty + 0.25);
        reasoning.push(`Increased difficulty due to strong focus area performance (${Math.round(areaPerformance.currentScore * 100)}%)`);
      }

      if (areaPerformance.improvementStatus === 'declining') {
        baseDifficulty = Math.max(0.5, baseDifficulty - 0.25);
        reasoning.push('Reduced difficulty due to declining focus area trend');
        priority = 'high';
      }
    }

    // 3. Improvement area prioritization
    if (isImprovementArea) {
      priority = priority === 'high' ? 'high' : 'medium';
      reasoning.push('Prioritized as improvement area');
    }

    // 4. Mood adjustments
    const moodAdjustments: { [key: string]: number } = {
      'motivated': 0.25,
      'energetic': 0.25,
      'focused': 0.1,
      'okay': 0,
      'calm': -0.1,
      'foggy': -0.25,
      'tired': -0.5,
      'stressed': -0.5
    };

    const moodAdjustment = moodAdjustments[mood.toLowerCase()] || 0;
    if (moodAdjustment !== 0) {
      baseDifficulty = Math.max(0.5, Math.min(3.0, baseDifficulty + moodAdjustment));
      reasoning.push(`Adjusted for ${mood} mood (${moodAdjustment > 0 ? '+' : ''}${moodAdjustment})`);
    }

    // 5. Session type adjustments
    if (sessionType === 'challenge') {
      baseDifficulty = Math.min(3.0, baseDifficulty + 0.5);
      reasoning.push('Increased difficulty for challenge session');
    } else if (sessionType === 'review') {
      baseDifficulty = Math.max(0.5, baseDifficulty - 0.25);
      reasoning.push('Reduced difficulty for review session');
    }

    // Round to nearest 0.25
    const recommendedDifficulty = Math.round(baseDifficulty * 4) / 4;

    return {
      exerciseId,
      recommendedDifficulty,
      reasoning,
      priority,
      focusArea
    };
  }

  private createBasicPerformance(): EnhancedUserPerformance {
    return {
      userId: this.userId,
      focusAreaPerformance: {},
      exerciseHistory: {},
      overallProgress: {
        strengths: [],
        improvementAreas: [],
        totalSessions: 0,
        averageScore: 0
      }
    };
  }

  // Get difficulty for a specific exercise (backward compatibility)
  async getExerciseDifficulty(exerciseId: string, mood: string): Promise<number> {
    if (!this.userPerformance) {
      await this.loadUserPerformance();
    }

    const exerciseHistory = this.userPerformance?.exerciseHistory[exerciseId];
    if (exerciseHistory) {
      return this.adjustForMood(exerciseHistory.currentDifficulty, mood);
    }

    // Default difficulty based on user's overall performance
    const overallScore = this.userPerformance?.overallProgress.averageScore || 0;
    let baseDifficulty = 1.0;
    
    if (overallScore >= 0.8) {
      baseDifficulty = 2.0;
    } else if (overallScore >= 0.6) {
      baseDifficulty = 1.5;
    } else {
      baseDifficulty = 1.0;
    }

    return this.adjustForMood(baseDifficulty, mood);
  }

  private adjustForMood(baseDifficulty: number, mood: string): number {
    const moodAdjustments: { [key: string]: number } = {
      'motivated': 0.25,
      'okay': 0,
      'foggy': -0.25,
      'tired': -0.5,
      'stressed': -0.5
    };

    const adjustment = moodAdjustments[mood.toLowerCase()] || 0;
    return Math.max(0.5, Math.min(3.0, baseDifficulty + adjustment));
  }

  // Update exercise performance after completion
  async updateExercisePerformance(result: {
    exerciseId: string;
    score: number;
    difficulty: number;
    timeSpent: number;
    focusArea: string;
  }): Promise<void> {
    try {
      // Send performance data to backend
      await api.post('/training/update-performance', {
        userId: this.userId,
        exerciseResult: result,
        timestamp: new Date().toISOString()
      });

      // Update local cache
      if (this.userPerformance) {
        const exerciseHistory = this.userPerformance.exerciseHistory[result.exerciseId] || {
          attempts: 0,
          averageScore: 0,
          lastScore: 0,
          currentDifficulty: 1,
          lastAttempt: '',
          improvementTrend: 'stable' as const
        };

        exerciseHistory.attempts++;
        exerciseHistory.lastScore = result.score;
        exerciseHistory.currentDifficulty = result.difficulty;
        exerciseHistory.lastAttempt = new Date().toISOString();
        
        // Update average score
        const previousTotal = exerciseHistory.averageScore * (exerciseHistory.attempts - 1);
        exerciseHistory.averageScore = (previousTotal + result.score) / exerciseHistory.attempts;

        this.userPerformance.exerciseHistory[result.exerciseId] = exerciseHistory;
      }
    } catch (error) {
      console.error('Failed to update exercise performance:', error);
    }
  }
}

// Export singleton instance
export const createEnhancedAdaptiveTraining = (userId: string) => {
  return new EnhancedAdaptiveTraining(userId);
};