// API service layer for backend communication
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('mindbloom-token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // Handle 401 Unauthorized specifically
    if (response.status === 401) {
      console.log('🔐 API: 401 Unauthorized - clearing token and redirecting to signin');
      localStorage.removeItem('mindbloom-token');
      localStorage.removeItem('mindbloom-user');
      // Don't redirect immediately, let the calling component handle it
      throw new Error('Not authenticated');
    }
    
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || `HTTP ${response.status}`);
  }
  return response.json();
};

// Training Session API
export interface ExerciseResult {
  exerciseId: string;
  score: number;
  timeSpent: number;
}

export interface TrainingSessionCreate {
  mood: string;
  focusAreas: string[];
}

export interface TrainingSessionComplete {
  exerciseResults: ExerciseResult[];
}

export interface TrainingSession {
  id: string;
  userId: string;
  mood: string;
  focusAreas: string[];
  exercises: any[];
  exerciseResults?: ExerciseResult[];
  averageScore?: number;
  isComplete: boolean;
  createdAt: string;
  completedAt?: string;
}

export const trainingAPI = {
  // Start a new training session
  async startSession(sessionData: TrainingSessionCreate): Promise<{
    sessionId: string;
    exercises: any[];
    message: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/training/session`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(sessionData)
    });
    return handleResponse(response);
  },

  // Complete a training session
  async completeSession(sessionId: string, completionData: TrainingSessionComplete): Promise<{
    message: string;
    averageScore: number;
    newStreak: number;
    totalSessions: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/training/session/${sessionId}/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(completionData)
    });
    return handleResponse(response);
  },

  // Get user's training sessions
  async getUserSessions(limit: number = 50, skip: number = 0): Promise<TrainingSession[]> {
    const response = await fetch(`${API_BASE_URL}/training/sessions?limit=${limit}&skip=${skip}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Progress API
export interface PerformanceTrend {
  date: string;
  score: number;
}

export interface FocusAreaAnalytics {
  area_name: string;
  current_score: number;
  improvement_status: string;
  sessions_count: number;
  average_score: number;
  best_score: number;
  trend_data: PerformanceTrend[];
}

export interface ProgressSummary {
  user_id: string;
  total_sessions: number;
  current_streak: number;
  overall_average_score: number;
  best_session_score: number;
  total_time_spent: number;
  focus_areas_analytics: FocusAreaAnalytics[];
  recent_performance_trend: PerformanceTrend[];
  improvement_areas: string[];
  strengths: string[];
  generated_at: string;
}

export const progressAPI = {
  // Get comprehensive progress analytics
  async getProgressSummary(): Promise<ProgressSummary> {
    const response = await fetch(`${API_BASE_URL}/progress/`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get today's performance analytics (only focus areas exercised today)
  async getTodayPerformance(): Promise<FocusAreaAnalytics[]> {
    const response = await fetch(`${API_BASE_URL}/progress/today`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// User API
export interface User {
  id: string;
  name: string;
  email: string;
  ageGroup: string;
  cognitiveConditions: string[];
  otherCondition?: string;
  reminderTime: string;
  timePreference?: string;
  goals: string[];
  cognitiveAreas: string[];
  streak: number;
  totalSessions: number;
  createdAt: string;
}

export interface UserUpdate {
  name?: string;
  ageGroup?: string;
  cognitiveConditions?: string[];
  otherCondition?: string;
  reminderTime?: string;
  timePreference?: string;
  goals?: string[];
  cognitiveAreas?: string[];
}

export const userAPI = {
  // Get current user profile
  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Update user profile
  async updateUser(userData: UserUpdate): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  }
};

// Combined data fetcher for components that need both user and session data
export const dataAPI = {
  // Get user data with exercise history from training sessions
  async getUserDataWithHistory(): Promise<{
    user: User;
    exerciseHistory: Array<{
      date: string;
      averageScore?: number;
      duration?: number;
      mood?: string;
      exercises: Array<{
        exerciseId: string;
        score?: number;
        skipped: boolean;
      }>;
    }>;
  }> {
    try {
      const [user, sessions] = await Promise.all([
        userAPI.getCurrentUser(),
        trainingAPI.getUserSessions()
      ]);

      // Transform training sessions into the format expected by frontend components
      const exerciseHistory = sessions
        .filter(session => session.isComplete)
        .map(session => ({
          date: session.completedAt || session.createdAt,
          averageScore: session.averageScore,
          duration: 0, // Duration not currently tracked in backend
          mood: session.mood,
          exercises: session.exerciseResults?.map(result => ({
            exerciseId: result.exerciseId,
            score: result.score,
            skipped: false
          })) || []
        }));

      return { user, exerciseHistory };
    } catch (error) {
      console.error('Error fetching user data with history:', error);
      throw error;
    }
  }
};

// Error handling utility
export class APIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'APIError';
  }
}

// Utility to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('mindbloom-token');
};

// Utility to handle authentication errors
export const handleAuthError = (error: any) => {
  if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
    localStorage.removeItem('mindbloom-token');
    localStorage.removeItem('mindbloom-user');
    window.location.href = '/signin';
  }
  throw error;
};