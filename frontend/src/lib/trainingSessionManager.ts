import { ComponentType } from 'react';

export interface ExerciseResult {
  exerciseId: string;
  score?: number;
  timeSpent?: number;
  difficulty?: number;
  skipped?: boolean;
  date: string;
  [key: string]: unknown;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  component: ComponentType<{
    onComplete: (result: ExerciseResult) => void;
    mood: string;
    userPreferences: Record<string, unknown>;
  }>;
  area: string;
  areaId: string;
}

interface TrainingSession {
  selectedFocusAreas: string[];
  completedAreas: Set<string>;
  sessionStartTime: number;
  sessionDuration: number;
  activitiesCompleted: number;
  currentActivity: number;
  currentRound: number;
  exerciseResults: ExerciseResult[];
}

export interface SessionContinuePromptData {
  pendingAreas: string[];
  onContinue: () => Activity[];
  onComplete: () => SessionCompletionData;
}

export interface SessionCompletionData {
  type: 'success' | 'partial' | 'timeout';
  completedAreas: string[];
  pendingAreas: string[];
  results: ExerciseResult[];
  duration: number;
  averageScore: number;
}

export class TrainingSessionManager {
  private session: TrainingSession;
  private readonly MAX_SESSION_DURATION = 10 * 60 * 1000; // 10 minutes in ms
  private readonly ACTIVITIES_PER_ROUND = 3;
  private onSessionContinuePrompt?: (data: SessionContinuePromptData) => void;
  private onSessionComplete?: (data: SessionCompletionData) => void;
  private availableActivities: Activity[];

  constructor(
    availableActivities: Activity[],
    onSessionContinuePrompt?: (data: SessionContinuePromptData) => void,
    onSessionComplete?: (data: SessionCompletionData) => void,
    preCompletedAreas?: string[]
  ) {
    this.availableActivities = availableActivities;
    this.onSessionContinuePrompt = onSessionContinuePrompt;
    this.onSessionComplete = onSessionComplete;
    this.session = this.createEmptySession();
    
    // Initialize with pre-completed areas from today's previous sessions
    if (preCompletedAreas && preCompletedAreas.length > 0) {
      preCompletedAreas.forEach(area => {
        this.session.completedAreas.add(area);
      });
      console.log('🎯 TrainingSessionManager: Initialized with pre-completed areas:', preCompletedAreas);
    }
  }

  private createEmptySession(): TrainingSession {
    return {
      selectedFocusAreas: [],
      completedAreas: new Set(),
      sessionStartTime: 0,
      sessionDuration: 0,
      activitiesCompleted: 0,
      currentActivity: 0,
      currentRound: 1,
      exerciseResults: []
    };
  }

  // Step 1: Initialize training session
  beginTraining(selectedFocusAreas: string[]): Activity[] {
    this.session = {
      selectedFocusAreas,
      completedAreas: new Set(),
      sessionStartTime: Date.now(),
      sessionDuration: 0,
      activitiesCompleted: 0,
      currentActivity: 0,
      currentRound: 1,
      exerciseResults: []
    };
    
    return this.presentActivities();
  }

  // Present 3 activities targeting selected/pending areas
  private presentActivities(): Activity[] {
    const pendingAreas = this.getPendingAreas();
    const activitiesToPresent = this.selectActivitiesForAreas(pendingAreas, this.ACTIVITIES_PER_ROUND);
    
    return activitiesToPresent;
  }

  // Step 2: Check completion conditions after each activity
  onActivityCompleted(result: ExerciseResult): {
    shouldContinue: boolean; 
    nextActivities?: Activity[];
    shouldPromptContinue?: boolean;
    shouldComplete?: boolean;
    completionData?: SessionCompletionData;
  } {
    // Add result to session
    this.session.exerciseResults.push(result);
    this.session.activitiesCompleted++;
    
    // Mark area as completed if the activity was successful
    if (!result.skipped && result.score !== undefined) {
      const activity = this.availableActivities.find(a => a.id === result.exerciseId);
      if (activity) {
        this.session.completedAreas.add(activity.areaId);
      }
    }
    
    this.updateSessionDuration();

    // Check if we should evaluate session completion
    if (this.shouldCheckCompletion()) {
      return this.evaluateSessionCompletion();
    } else {
      // Continue with next activity in current round
      this.session.currentActivity++;
      return { shouldContinue: true };
    }
  }

  private shouldCheckCompletion(): boolean {
    return (
      this.session.activitiesCompleted % this.ACTIVITIES_PER_ROUND === 0 ||
      this.session.sessionDuration >= this.MAX_SESSION_DURATION
    );
  }

  // Step 3: Evaluate if session should continue or complete
  private evaluateSessionCompletion(): {
    shouldContinue: boolean;
    shouldPromptContinue?: boolean;
    shouldComplete?: boolean;
    completionData?: SessionCompletionData;
  } {
    const pendingAreas = this.getPendingAreas();
    
    if (pendingAreas.length === 0) {
      // All areas completed - success completion
      const completionData = this.createCompletionData('success', pendingAreas);
      return {
        shouldContinue: false,
        shouldComplete: true,
        completionData
      };
    } else if (this.session.sessionDuration >= this.MAX_SESSION_DURATION) {
      // Time exceeded - timeout completion
      const completionData = this.createCompletionData('timeout', pendingAreas);
      return {
        shouldContinue: false,
        shouldComplete: true,
        completionData
      };
    } else {
      // Some areas still pending - prompt to continue
      return {
        shouldContinue: false,
        shouldPromptContinue: true
      };
    }
  }

  // Get data for continuation prompt
  getContinuePromptData(): SessionContinuePromptData {
    const pendingAreas = this.getPendingAreas();
    
    return {
      pendingAreas,
      onContinue: () => {
        return this.continueSession();
      },
      onComplete: () => {
        return this.completeSessionPartial();
      }
    };
  }

  private continueSession(): Activity[] {
    // Reset session duration but keep completed areas and results
    this.session.sessionStartTime = Date.now();
    this.session.sessionDuration = 0;
    this.session.currentActivity = 0;
    this.session.currentRound++;
    
    // Return to presenting activities (Step 1)
    return this.presentActivities();
  }

  private completeSessionPartial(): SessionCompletionData {
    const pendingAreas = this.getPendingAreas();
    
    // Persist pending areas with user-specific storage and session date
    if (pendingAreas.length > 0) {
      this.savePendingAreasForUser(pendingAreas);
    }
    
    return this.createCompletionData('partial', pendingAreas);
  }

  private savePendingAreasForUser(pendingAreas: string[]): void {
    // Get user data to tie pending areas to specific user
    const userData = localStorage.getItem('mindbloom-user');
    if (!userData) return;

    const user = JSON.parse(userData);
    const userId = user.id || user.email || 'default-user';
    const sessionDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Get existing pending sessions for this user
    const existingPendingKey = `mindbloom-pending-sessions-${userId}`;
    const existingPending = localStorage.getItem(existingPendingKey);
    let pendingSessions: { [date: string]: string[] } = {};
    
    if (existingPending) {
      try {
        pendingSessions = JSON.parse(existingPending);
      } catch (e) {
        console.error('Error parsing existing pending sessions:', e);
      }
    }
    
    // Add/update pending areas for this session date
    pendingSessions[sessionDate] = pendingAreas;
    
    // Save back to localStorage
    localStorage.setItem(existingPendingKey, JSON.stringify(pendingSessions));
  }

  // Static method to get all pending areas for current user
  static getAllPendingAreasForUser(): { [date: string]: string[] } {
    const userData = localStorage.getItem('mindbloom-user');
    if (!userData) return {};

    const user = JSON.parse(userData);
    const userId = user.id || user.email || 'default-user';
    const pendingKey = `mindbloom-pending-sessions-${userId}`;
    const pendingData = localStorage.getItem(pendingKey);
    
    if (!pendingData) return {};
    
    try {
      return JSON.parse(pendingData);
    } catch (e) {
      console.error('Error parsing pending sessions:', e);
      return {};
    }
  }

  // Static method to clear completed areas from pending sessions
  static clearCompletedAreasFromPending(completedAreas: string[]): void {
    const userData = localStorage.getItem('mindbloom-user');
    if (!userData) return;

    const user = JSON.parse(userData);
    const userId = user.id || user.email || 'default-user';
    const pendingKey = `mindbloom-pending-sessions-${userId}`;
    const pendingData = localStorage.getItem(pendingKey);
    
    if (!pendingData) return;
    
    try {
      const pendingSessions: { [date: string]: string[] } = JSON.parse(pendingData);
      let hasChanges = false;
      
      // Remove completed areas from all pending sessions
      Object.keys(pendingSessions).forEach(date => {
        const originalLength = pendingSessions[date].length;
        pendingSessions[date] = pendingSessions[date].filter(area => !completedAreas.includes(area));
        
        // If session has no pending areas left, remove the entire session
        if (pendingSessions[date].length === 0) {
          delete pendingSessions[date];
          hasChanges = true;
        } else if (pendingSessions[date].length !== originalLength) {
          hasChanges = true;
        }
      });
      
      // Save updated pending sessions
      if (hasChanges) {
        if (Object.keys(pendingSessions).length === 0) {
          localStorage.removeItem(pendingKey);
        } else {
          localStorage.setItem(pendingKey, JSON.stringify(pendingSessions));
        }
      }
    } catch (e) {
      console.error('Error updating pending sessions:', e);
    }
  }

  private createCompletionData(type: 'success' | 'partial' | 'timeout', pendingAreas: string[]): SessionCompletionData {
    const completedAreas = Array.from(this.session.completedAreas);
    
    // Only include exercises that weren't skipped in the average calculation
    const completedExercises = this.session.exerciseResults.filter(r => !r.skipped && r.score !== undefined);
    const averageScore = completedExercises.length > 0
      ? completedExercises.reduce((sum, r) => sum + (r.score || 0), 0) / completedExercises.length
      : 0;
    
    return {
      type,
      completedAreas,
      pendingAreas,
      results: this.session.exerciseResults,
      duration: Math.round(this.session.sessionDuration / 1000 / 60), // Convert to minutes
      averageScore: Math.round(averageScore)
    };
  }

  // Helper methods
  private getPendingAreas(): string[] {
    return this.session.selectedFocusAreas.filter(
      area => !this.session.completedAreas.has(area)
    );
  }

  private updateSessionDuration(): void {
    this.session.sessionDuration = Date.now() - this.session.sessionStartTime;
  }

  private selectActivitiesForAreas(areas: string[], count: number): Activity[] {
    // Get activities that match the pending areas
    const matchingActivities = this.availableActivities.filter(activity => 
      areas.includes(activity.areaId)
    );
    
    // If we don't have enough matching activities, fill with any available activities
    const selectedActivities: Activity[] = [];
    const usedIds = new Set<string>();
    
    // First, prioritize activities for pending areas
    for (const area of areas) {
      const areaActivities = matchingActivities.filter(a => 
        a.areaId === area && !usedIds.has(a.id)
      );
      
      if (areaActivities.length > 0 && selectedActivities.length < count) {
        // Randomly select one activity for this area
        const randomActivity = areaActivities[Math.floor(Math.random() * areaActivities.length)];
        selectedActivities.push(randomActivity);
        usedIds.add(randomActivity.id);
      }
    }
    
    // Fill remaining slots with any available activities
    while (selectedActivities.length < count) {
      const remainingActivities = this.availableActivities.filter(a => !usedIds.has(a.id));
      if (remainingActivities.length === 0) break;
      
      const randomActivity = remainingActivities[Math.floor(Math.random() * remainingActivities.length)];
      selectedActivities.push(randomActivity);
      usedIds.add(randomActivity.id);
    }
    
    return selectedActivities;
  }

  // Getters for session state
  getCurrentSession(): TrainingSession {
    return { ...this.session };
  }

  getSessionProgress(): {
    currentActivity: number;
    totalActivities: number;
    currentRound: number;
    completedAreas: string[];
    pendingAreas: string[];
    sessionDuration: number;
  } {
    return {
      currentActivity: this.session.currentActivity,
      totalActivities: this.ACTIVITIES_PER_ROUND,
      currentRound: this.session.currentRound,
      completedAreas: Array.from(this.session.completedAreas),
      pendingAreas: this.getPendingAreas(),
      sessionDuration: this.session.sessionDuration
    };
  }

  // Check if session is in progress
  isSessionActive(): boolean {
    return this.session.sessionStartTime > 0;
  }

  // Reset session
  resetSession(): void {
    this.session = this.createEmptySession();
  }
}