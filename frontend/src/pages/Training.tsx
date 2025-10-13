import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Clock, ArrowRight, Home, RotateCcw, ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { showSuccess } from "@/utils/toast";
import { theme, getAreaColor } from "@/lib/theme";
import { selectExercises, calculateDifficulty, updateExerciseStats, adjustForMood } from "@/lib/adaptiveTraining";
import { TrainingSessionManager, ExerciseResult, SessionCompletionData } from "@/lib/trainingSessionManager";
import { trainingAPI, userAPI, handleAuthError, progressAPI } from "@/lib/api";
import SessionContinuePrompt from "@/components/SessionContinuePrompt";
import MemoryExercise from "@/components/exercises/MemoryExercise";
import AttentionExercise from "@/components/exercises/AttentionExercise";
import LanguageExercise from "@/components/exercises/LanguageExercise";
import SequencingExercise from "@/components/exercises/SequencingExercise";
import MindfulMemoryExercise from "@/components/exercises/MindfulMemoryExercise";
import ConversationExercise from "@/components/exercises/ConversationExercise";
import VisualRecallExercise from "@/components/exercises/VisualRecallExercise";
import ProfileSettingsButton from "@/components/ProfileSettingsButton";
import ScrollIndicator from "@/components/ui/scroll-indicator";

const Training = () => {
  const navigate = useNavigate();
  const [currentExercise, setCurrentExercise] = useState(0);
  const [sessionStartTime] = useState(Date.now());
  const [exerciseResults, setExerciseResults] = useState<ExerciseResult[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [todaysMood, setTodaysMood] = useState<string>('okay');
  const [todaysFocusAreas, setTodaysFocusAreas] = useState<string[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [sessionManager, setSessionManager] = useState<TrainingSessionManager | null>(null);
  const [showContinuePrompt, setShowContinuePrompt] = useState(false);
  const [sessionState, setSessionState] = useState<'training' | 'continue-prompt' | 'completed'>('training');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [todaysCompletedAreas, setTodaysCompletedAreas] = useState<string[]>([]);

  // Exercise mapping with adaptive difficulty
  const getExerciseSet = () => {
    if (!userData || todaysFocusAreas.length === 0) return [];
    
    // Use adaptive exercise selection
    const selectedExerciseIds = selectExercises(todaysFocusAreas, userData, todaysMood);
    
    const exerciseComponents: { [key: string]: any } = {
      memory: {
        id: 'memory',
        title: 'Memory Challenge',
        description: 'Remember and recall sequences',
        component: MemoryExercise,
        area: 'Memory',
        areaId: 'memory'
      },
      'mindful-memory': {
        id: 'mindful-memory',
        title: 'Mindful Memory',
        description: 'Memory training with guided breathing',
        component: MindfulMemoryExercise,
        area: 'Memory & Mindfulness',
        areaId: 'memory'
      },
      'visual-recall': { // New exercise component
        id: 'visual-recall',
        title: 'Visual Recall',
        description: 'Memorize and recall visual patterns',
        component: VisualRecallExercise,
        area: 'Memory & Spatial',
        areaId: 'spatial' // Can also be memory, but spatial fits well
      },
      attention: {
        id: 'attention',
        title: 'Attention Training',
        description: 'Selective attention and concentration',
        component: AttentionExercise,
        area: 'Attention',
        areaId: 'attention'
      },
      'pattern-recognition': {
        id: 'pattern-recognition',
        title: 'Pattern Recognition',
        description: 'Identify and match visual patterns',
        component: AttentionExercise, // Reusing AttentionExercise for now
        area: 'Attention & Perception',
        areaId: 'attention'
      },
      'rapid-matching': {
        id: 'rapid-matching',
        title: 'Rapid Matching',
        description: 'Quickly match symbols or items',
        component: AttentionExercise, // Reusing AttentionExercise for now
        area: 'Processing Speed',
        areaId: 'processing'
      },
      language: {
        id: 'language',
        title: 'Word Skills',
        description: 'Language and verbal reasoning',
        component: LanguageExercise,
        area: 'Language',
        areaId: 'language'
      },
      conversation: {
        id: 'conversation',
        title: 'Social Skills',
        description: 'Real-world conversation practice',
        component: ConversationExercise,
        area: 'Language & Communication',
        areaId: 'language'
      },
      'word-association': {
        id: 'word-association',
        title: 'Word Association',
        description: 'Connect words based on meaning',
        component: LanguageExercise, // Reusing LanguageExercise for now
        area: 'Language',
        areaId: 'language'
      },
      sequencing: {
        id: 'sequencing',
        title: 'Task Sequencing',
        description: 'Organize everyday activities in order',
        component: SequencingExercise,
        area: 'Executive Function',
        areaId: 'executive'
      },
      'logic-puzzle': {
        id: 'logic-puzzle',
        title: 'Logic Puzzle',
        description: 'Solve logical problems and deductions',
        component: SequencingExercise, // Reusing SequencingExercise for now
        area: 'Executive Function',
        areaId: 'executive'
      },
      'story-creation': {
        id: 'story-creation',
        title: 'Story Creation',
        description: 'Develop imaginative narratives',
        component: ConversationExercise, // Use ConversationExercise for story creation
        area: 'Creativity',
        areaId: 'creativity'
      },
      'spatial-puzzle': {
        id: 'spatial-puzzle',
        title: 'Spatial Puzzle',
        description: 'Arrange shapes or objects in space',
        component: VisualRecallExercise, // Reusing VisualRecallExercise for now
        area: 'Spatial Reasoning',
        areaId: 'spatial'
      }
    };

    return selectedExerciseIds.map(id => exerciseComponents[id]).filter(Boolean);
  };

  // Function to convert backend exercise data to frontend format
  const convertBackendExercisesToFrontend = (backendExercises: any[]) => {
    const exerciseComponentMap: { [key: string]: any } = {
      // Memory exercises
      'memory_sequence': {
        component: MemoryExercise,
        area: 'Memory',
        areaId: 'memory'
      },
      'word_pairs': {
        component: MemoryExercise,
        area: 'Memory',
        areaId: 'memory'
      },
      'visual_recall': {
        component: VisualRecallExercise,
        area: 'Memory & Spatial',
        areaId: 'memory'
      },
      // Attention exercises
      'focused_attention': {
        component: AttentionExercise,
        area: 'Attention',
        areaId: 'attention'
      },
      'divided_attention': {
        component: AttentionExercise,
        area: 'Attention',
        areaId: 'attention'
      },
      'sustained_attention': {
        component: AttentionExercise,
        area: 'Attention',
        areaId: 'attention'
      },
      // Language exercises
      'word_finding': {
        component: LanguageExercise,
        area: 'Language',
        areaId: 'language'
      },
      'sentence_completion': {
        component: LanguageExercise,
        area: 'Language',
        areaId: 'language'
      },
      'verbal_fluency': {
        component: LanguageExercise,
        area: 'Language',
        areaId: 'language'
      },
      // Executive exercises
      'planning_task': {
        component: SequencingExercise,
        area: 'Executive Function',
        areaId: 'executive'
      },
      'cognitive_flexibility': {
        component: SequencingExercise,
        area: 'Executive Function',
        areaId: 'executive'
      },
      'inhibition_control': {
        component: SequencingExercise,
        area: 'Executive Function',
        areaId: 'executive'
      },
      // Processing exercises
      'speed_processing': {
        component: MemoryExercise, // Use MemoryExercise for speed processing (timed recall tasks)
        area: 'Processing Speed',
        areaId: 'processing'
      },
      'pattern_recognition': {
        component: VisualRecallExercise, // Use VisualRecallExercise for pattern recognition
        area: 'Processing Speed',
        areaId: 'processing'
      },
      // Spatial exercises
      '3d_rotation': {
        component: VisualRecallExercise,
        area: 'Spatial Reasoning',
        areaId: 'spatial'
      },
      'mental_folding': {
        component: VisualRecallExercise,
        area: 'Spatial Reasoning',
        areaId: 'spatial'
      },
      'spatial_navigation': {
        component: VisualRecallExercise,
        area: 'Spatial Reasoning',
        areaId: 'spatial'
      },
      'block_design': {
        component: VisualRecallExercise,
        area: 'Spatial Reasoning',
        areaId: 'spatial'
      },
      'perspective_taking': {
        component: VisualRecallExercise,
        area: 'Spatial Reasoning',
        areaId: 'spatial'
      },
      // Creativity exercises
      'alternative_uses': {
        component: LanguageExercise,
        area: 'Creativity',
        areaId: 'creativity'
      },
      'story_building': {
        component: ConversationExercise,
        area: 'Creativity',
        areaId: 'creativity'
      },
      'visual_metaphors': {
        component: VisualRecallExercise,
        area: 'Creativity',
        areaId: 'creativity'
      },
      'pattern_breaking': {
        component: SequencingExercise,
        area: 'Creativity',
        areaId: 'creativity'
      },
      'musical_creativity': {
        component: ConversationExercise, // Use ConversationExercise instead of MindfulMemoryExercise
        area: 'Creativity',
        areaId: 'creativity'
      },
      'perspective_shift': {
        component: ConversationExercise,
        area: 'Creativity',
        areaId: 'creativity'
      },
      // Perception exercises
      'visual_perception': {
        component: VisualRecallExercise,
        area: 'Perception',
        areaId: 'perception'
      },
      'spatial_awareness': {
        component: VisualRecallExercise,
        area: 'Perception',
        areaId: 'perception'
      },
      'object_recognition': {
        component: VisualRecallExercise,
        area: 'Perception',
        areaId: 'perception'
      },
      // General exercises
      'mindful_breathing': {
        component: MindfulMemoryExercise,
        area: 'General',
        areaId: 'general'
      },
      'cognitive_warm_up': {
        component: MemoryExercise,
        area: 'General',
        areaId: 'general'
      },
      'mental_flexibility': {
        component: SequencingExercise,
        area: 'General',
        areaId: 'general'
      }
    };

    return backendExercises.map(backendEx => {
      const mapping = exerciseComponentMap[backendEx.id];
      if (!mapping) {
        console.warn(`No component mapping found for exercise: ${backendEx.id}`);
        // Fallback to a default exercise
        return {
          id: backendEx.id,
          title: backendEx.name || 'Unknown Exercise',
          description: backendEx.description || 'Exercise description',
          component: MemoryExercise, // Default fallback
          area: 'General',
          areaId: 'general'
        };
      }

      return {
        id: backendEx.id,
        title: backendEx.name || 'Exercise',
        description: backendEx.description || 'Exercise description',
        component: mapping.component,
        area: mapping.area,
        areaId: mapping.areaId
      };
    });
  };

  useEffect(() => {
    const initializeSession = async () => {
      try {
        setLoading(true);
        
        // Get user data from API
        const user = await userAPI.getCurrentUser();
        setUserData(user);
        
        // Get mood and focus areas from localStorage (set during onboarding)
        const mood = localStorage.getItem('mindbloom-today-mood');
        const focusAreas = localStorage.getItem('mindbloom-today-focus-areas');
        
        // Check if user has completed the required setup flow
        if (!mood || !focusAreas) {
          console.log('🏃‍♂️ Training: Missing mood or focus areas, redirecting to dashboard');
          navigate('/dashboard');
          return;
        }
        
        setTodaysMood(mood);
        const parsedFocusAreas = JSON.parse(focusAreas);
        setTodaysFocusAreas(parsedFocusAreas);
        
        // Fetch today's completed areas to initialize session manager properly
        try {
          const todayProgress = await progressAPI.getTodayPerformance();
          const completedAreas: string[] = [];
          
          if (todayProgress.hasData && todayProgress.areas) {
            // Extract focus area keys from today's progress data
            completedAreas.push(...Object.keys(todayProgress.areas));
            console.log('🎯 Training: Found today\'s completed areas:', completedAreas);
          }
          
          setTodaysCompletedAreas(completedAreas);
        } catch (progressError) {
          console.warn('🏃‍♂️ Training: Could not fetch today\'s progress, continuing without pre-completed areas:', progressError);
          setTodaysCompletedAreas([]);
        }
        
        // Start training session via API
        const sessionResponse = await trainingAPI.startSession({
          mood,
          focusAreas: parsedFocusAreas
        });
        
        setCurrentSessionId(sessionResponse.sessionId);
        
        // Convert backend exercises to frontend format
        if (sessionResponse.exercises && sessionResponse.exercises.length > 0) {
          const frontendExercises = convertBackendExercisesToFrontend(sessionResponse.exercises);
          console.log('🏃‍♂️ Training: Converted exercises:', frontendExercises);
          setExercises(frontendExercises);
        } else {
          // Fallback to local exercise generation if backend doesn't return exercises
          console.log('🏃‍♂️ Training: No exercises from backend, using local generation');
          const localExercises = getExerciseSet();
          setExercises(localExercises);
        }
      } catch (error) {
        console.error('Error initializing training session:', error);
        handleAuthError(error);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, [navigate]);

  useEffect(() => {
    if (userData && todaysFocusAreas.length > 0) {
      setExercises(getExerciseSet());
    }
  }, [userData, todaysFocusAreas, todaysMood]);

  const handleExerciseComplete = (result: ExerciseResult) => {
    if (!sessionManager) {
      // Fallback to old behavior if session manager not initialized
      handleExerciseCompleteOld(result);
      return;
    }

    // Calculate adaptive difficulty for this exercise
    const baseDifficulty = calculateDifficulty(result.exerciseId, userData);
    const adjustedDifficulty = adjustForMood(baseDifficulty, todaysMood);
    
    const enhancedResult: ExerciseResult = {
      ...result,
      difficulty: adjustedDifficulty,
      date: new Date().toISOString()
    };
    
    const newResults = [...exerciseResults, enhancedResult];
    setExerciseResults(newResults);

    // Use session manager to determine next action
    const sessionResult = sessionManager.onActivityCompleted(enhancedResult);
    
    if (sessionResult.shouldComplete && sessionResult.completionData) {
      completeSessionWithData(sessionResult.completionData, newResults);
    } else if (sessionResult.shouldPromptContinue) {
      setSessionState('continue-prompt');
    } else if (sessionResult.shouldContinue) {
      if (currentExercise < exercises.length - 1) {
        setCurrentExercise(currentExercise + 1);
      } else {
        // This shouldn't happen with the new algorithm, but fallback
        completeSession(newResults);
      }
    }
  };

  // Fallback method for old behavior
  const handleExerciseCompleteOld = (result: ExerciseResult) => {
    const baseDifficulty = calculateDifficulty(result.exerciseId, userData);
    const adjustedDifficulty = adjustForMood(baseDifficulty, todaysMood);
    
    const enhancedResult: ExerciseResult = {
      ...result,
      difficulty: adjustedDifficulty,
      date: new Date().toISOString()
    };
    
    const newResults = [...exerciseResults, enhancedResult];
    setExerciseResults(newResults);

    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    } else {
      completeSession(newResults);
    }
  };

  const completeSession = async (results: ExerciseResult[]) => {
    if (!currentSessionId) {
      console.error('No session ID available for completion');
      return;
    }

    try {
      const sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000 / 60);
      
      // Only include exercises that weren't skipped in the average calculation
      const completedExercises = results.filter(r => !r.skipped && r.score !== undefined);
      
      // Prepare exercise results for API
      const exerciseResults = completedExercises.map(result => ({
        exerciseId: result.exerciseId,
        score: result.score || 0,
        timeSpent: result.timeSpent || 0
      }));

      // Complete session via API
      const completionResponse = await trainingAPI.completeSession(currentSessionId, {
        exerciseResults
      });

      showSuccess(`Great job! Session completed in ${sessionDuration} minutes.`);
      navigate('/session-complete', {
        state: {
          results,
          duration: sessionDuration,
          averageScore: completionResponse.averageScore,
          newStreak: completionResponse.newStreak,
          totalSessions: completionResponse.totalSessions
        }
      });
    } catch (error) {
      console.error('Error completing session:', error);
      // Fallback to local completion if API fails
      const sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000 / 60);
      const completedExercises = results.filter(r => !r.skipped && r.score !== undefined);
      const averageScore = completedExercises.length > 0
        ? completedExercises.reduce((sum, r) => sum + (r.score || 0), 0) / completedExercises.length
        : 0;
      
      navigate('/session-complete', {
        state: {
          results,
          duration: sessionDuration,
          averageScore: Math.round(averageScore)
        }
      });
    }
  };

  const completeSessionWithData = async (completionData: SessionCompletionData, results: ExerciseResult[]) => {
    if (!currentSessionId) {
      console.error('No session ID available for completion');
      return;
    }

    try {
      // Only include exercises that weren't skipped in the average calculation
      const completedExercises = results.filter(r => !r.skipped && r.score !== undefined);
      
      // Prepare exercise results for API
      const exerciseResults = completedExercises.map(result => ({
        exerciseId: result.exerciseId,
        score: result.score || 0,
        timeSpent: result.timeSpent || 0
      }));

      // Complete session via API
      const completionResponse = await trainingAPI.completeSession(currentSessionId, {
        exerciseResults
      });

      const successMessage = completionData.type === 'success'
        ? 'Amazing! You completed all focus areas!'
        : completionData.type === 'timeout'
        ? 'Great 10-minute session completed!'
        : 'Excellent progress made today!';
      
      showSuccess(successMessage);
      navigate('/session-complete', {
        state: {
          completionData,
          results,
          duration: completionData.duration,
          averageScore: completionResponse.averageScore,
          newStreak: completionResponse.newStreak,
          totalSessions: completionResponse.totalSessions
        }
      });
    } catch (error) {
      console.error('Error completing session with data:', error);
      // Fallback to local completion
      const successMessage = completionData.type === 'success'
        ? 'Amazing! You completed all focus areas!'
        : completionData.type === 'timeout'
        ? 'Great 10-minute session completed!'
        : 'Excellent progress made today!';
      
      showSuccess(successMessage);
      navigate('/session-complete', {
        state: {
          completionData,
          results,
          duration: completionData.duration,
          averageScore: completionData.averageScore
        }
      });
    }
  };

  const updateUserData = (results: ExerciseResult[], sessionDuration: number, averageScore: number) => {
    if (userData) {
      // Update exercise statistics with adaptive learning
      let updatedUserData = { ...userData };
      results.forEach(result => {
        // Convert to the format expected by updateExerciseStats
        const adaptiveResult = {
          ...result,
          score: result.score || 0, // Ensure score is always a number
          timeSpent: result.timeSpent || 0, // Ensure timeSpent is always a number
          difficulty: result.difficulty || 1 // Ensure difficulty is always a number
        };
        updatedUserData = updateExerciseStats(updatedUserData, adaptiveResult);
      });
      
      // Update session data
      updatedUserData = {
        ...updatedUserData,
        totalSessions: (updatedUserData.totalSessions || 0) + 1,
        streak: (updatedUserData.streak || 0) + 1,
        lastSessionDate: new Date().toISOString(),
        lastSessionScore: averageScore,
        lastSessionDuration: sessionDuration,
        lastSessionMood: todaysMood,
        lastSessionFocusAreas: todaysFocusAreas,
        exerciseHistory: [
          ...(updatedUserData.exerciseHistory || []),
          {
            date: new Date().toISOString(),
            sessionStartTime: new Date(sessionStartTime).toISOString(),
            sessionEndTime: new Date().toISOString(),
            exercises: results,
            mood: todaysMood,
            focusAreas: todaysFocusAreas,
            focusAreasCompleted: [...new Set(results.map(r => exercises.find(e => e.id === r.exerciseId)?.areaId).filter(Boolean))],
            duration: sessionDuration,
            averageScore,
            username: userData.name || userData.displayName,
            exercisePerformance: results.map(r => ({
              exerciseId: r.exerciseId,
              areaId: exercises.find(e => e.id === r.exerciseId)?.areaId,
              score: r.score || 0,
              timeSpent: r.timeSpent || 0,
              difficulty: r.difficulty || 1,
              completed: !r.skipped
            }))
          }
        ].slice(-30) // Keep last 30 sessions
      };
      
      localStorage.setItem('mindbloom-user', JSON.stringify(updatedUserData));
    }
  };

  const skipExercise = () => {
    const skippedResult: ExerciseResult = {
      exerciseId: exercises[currentExercise].id,
      skipped: true,
      score: 0,
      timeSpent: 0,
      difficulty: 1,
      date: new Date().toISOString()
    };
    handleExerciseComplete(skippedResult);
  };

  const restartExercise = () => {
    setCurrentExercise(currentExercise);
  };

  const handleSignOut = () => {
    localStorage.removeItem('mindbloom-user');
    localStorage.removeItem('mindbloom-today-mood');
    localStorage.removeItem('mindbloom-last-mood-date');
    localStorage.removeItem('mindbloom-today-focus-areas');
    localStorage.removeItem('mindbloom-last-focus-date');
    localStorage.removeItem('mindbloom-notes');
    localStorage.removeItem('mindbloom-checklists');
    localStorage.removeItem('mindbloom-reminders');
    
    navigate('/goodbye');
  };

  const handleBackToFocusSelection = () => {
    // Navigate directly to focus selection page
    navigate('/focus-selection');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  // Initialize session manager when data is ready
  useEffect(() => {
    if (userData && todaysFocusAreas.length > 0 && exercises.length > 0 && !sessionManager) {
      const availableActivities = exercises.map(ex => ({
        id: ex.id,
        title: ex.title,
        description: ex.description,
        component: ex.component,
        area: ex.area,
        areaId: ex.areaId
      }));

      const manager = new TrainingSessionManager(
        availableActivities,
        undefined,
        undefined,
        todaysCompletedAreas // Pass today's completed areas to initialize properly
      );
      const initialActivities = manager.beginTraining(todaysFocusAreas);
      
      // Update exercises to match the session manager's selection
      if (initialActivities.length > 0) {
        setExercises(initialActivities);
        setCurrentExercise(0);
      }
      
      setSessionManager(manager);
    }
  }, [userData, todaysFocusAreas, exercises.length, sessionManager, todaysCompletedAreas]);

  // Handle continue session
  const handleContinueSession = () => {
    if (sessionManager) {
      const continueData = sessionManager.getContinuePromptData();
      const newActivities = continueData.onContinue();
      
      if (newActivities.length > 0) {
        setExercises(newActivities);
        setCurrentExercise(0);
        setSessionState('training');
      }
    }
  };

  // Handle complete session from continue prompt - go to session completion page
  const handleCompleteFromPrompt = () => {
    if (sessionManager) {
      const continueData = sessionManager.getContinuePromptData();
      const completionData = continueData.onComplete();
      completeSessionWithData(completionData, exerciseResults);
    }
  };

  // Show continue prompt
  if (sessionState === 'continue-prompt' && sessionManager) {
    const progress = sessionManager.getSessionProgress();
    return (
      <SessionContinuePrompt
        pendingAreas={progress.pendingAreas}
        completedAreas={progress.completedAreas}
        sessionDuration={progress.sessionDuration}
        currentRound={progress.currentRound}
        onContinue={handleContinueSession}
        onComplete={handleCompleteFromPrompt}
      />
    );
  }

  if (loading || !userData || exercises.length === 0 || !exercises[currentExercise]) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Brain className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-pulse" />
            <p className="text-xl text-gray-700">
              {loading ? 'Starting your training session...' : 'Preparing your personalized session...'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentExerciseData = exercises[currentExercise];
  const CurrentExerciseComponent = currentExerciseData?.component;
  
  // Additional safety check
  if (!CurrentExerciseComponent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Brain className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-pulse" />
            <p className="text-xl text-gray-700">Loading exercise component...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentExercise) / exercises.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50">
      {/* Header - Updated Layout */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* LEFT: Back to Dashboard Button */}
          <Button
            variant="outline"
            onClick={handleDashboard}
            className="px-4 py-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          {/* CENTER: Training Session Branding */}
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent">
              Training Session
            </h1>
          </div>
          
          {/* RIGHT: Settings, Sign Out Button, and User Greeting */}
          <div className="flex items-center space-x-2">
            <ProfileSettingsButton /> {/* Add the settings button here */}
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="px-3 py-2 text-gray-600 hover:text-gray-800"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Sign Out
            </Button>
            <div className="flex items-center justify-center px-3 py-1 bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-medium rounded-full">
              Hi, {userData.displayName || userData.name}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Section */}
      <div className="container mx-auto px-4 mb-8">
        <Card className="border-indigo-200 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <span className="text-lg font-semibold text-indigo-900">
                  Exercise {currentExercise + 1} of {exercises.length}
                </span>
                <Badge 
                  variant="secondary" 
                  className="bg-indigo-100 text-indigo-800 border-indigo-200"
                >
                  {currentExerciseData.area}
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {Math.round((Date.now() - sessionStartTime) / 1000 / 60)} min
                </span>
              </div>
            </div>
            <Progress 
              value={progress} 
              className="h-3 bg-indigo-100"
            />
            <div className="mt-2 text-sm text-gray-600 text-center">
              {Math.round(progress)}% complete
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exercise Content */}
      <div className="container mx-auto px-4">
        {/* Added exerciseData.id to key for better re-render */}
        <CurrentExerciseComponent
          key={`${currentExerciseData.id}-${currentExercise}-${Date.now()}`}
          onComplete={handleExerciseComplete}
          mood={todaysMood}
          userPreferences={{
            ...userData,
            difficulty: calculateDifficulty(currentExerciseData.id, userData) // Pass calculated difficulty
          }}
        />
      </div>

      {/* Exercise Controls */}
      <div className="container mx-auto px-4 mt-8 pb-8">
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={restartExercise}
            className="px-6 py-3 border-cyan-200 text-cyan-700 hover:bg-cyan-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart Exercise
          </Button>
          
          <Button
            variant="outline"
            onClick={skipExercise}
            className="px-6 py-3 border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Skip Exercise
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        
        <div className="text-center mt-4">
          <p className="text-gray-600">
            Need a rest? Come back tomorrow—your progress is saved!
          </p>
        </div>
      </div>
      <ScrollIndicator />
    </div>
  );
};

export default Training;