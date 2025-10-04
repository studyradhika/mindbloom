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
import MemoryExercise from "@/components/exercises/MemoryExercise";
import AttentionExercise from "@/components/exercises/AttentionExercise";
import LanguageExercise from "@/components/exercises/LanguageExercise";
import SequencingExercise from "@/components/exercises/SequencingExercise";
import MindfulMemoryExercise from "@/components/exercises/MindfulMemoryExercise";
import ConversationExercise from "@/components/exercises/ConversationExercise";

const Training = () => {
  const navigate = useNavigate();
  const [currentExercise, setCurrentExercise] = useState(0);
  const [sessionStartTime] = useState(Date.now());
  const [exerciseResults, setExerciseResults] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [todaysMood, setTodaysMood] = useState<string>('okay');
  const [todaysFocusAreas, setTodaysFocusAreas] = useState<string[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);

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
      attention: {
        id: 'attention',
        title: 'Attention Training',
        description: 'Selective attention and concentration',
        component: AttentionExercise,
        area: 'Attention',
        areaId: 'attention'
      },
      language: {
        id: 'language',
        title: 'Word Skills',
        description: 'Language and verbal reasoning',
        component: LanguageExercise,
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
      'mindful-memory': {
        id: 'mindful-memory',
        title: 'Mindful Memory',
        description: 'Memory training with guided breathing',
        component: MindfulMemoryExercise,
        area: 'Creativity & Mindfulness',
        areaId: 'creativity'
      },
      conversation: {
        id: 'conversation',
        title: 'Social Skills',
        description: 'Real-world conversation practice',
        component: ConversationExercise,
        area: 'Language & Communication',
        areaId: 'language'
      }
    };

    return selectedExerciseIds.map(id => exerciseComponents[id]).filter(Boolean);
  };

  useEffect(() => {
    const storedData = localStorage.getItem('mindbloom-user');
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
    
    const mood = localStorage.getItem('mindbloom-today-mood') || 'okay';
    const focusAreas = localStorage.getItem('mindbloom-today-focus-areas');
    
    setTodaysMood(mood);
    if (focusAreas) {
      setTodaysFocusAreas(JSON.parse(focusAreas));
    }
  }, []);

  useEffect(() => {
    if (userData && todaysFocusAreas.length > 0) {
      setExercises(getExerciseSet());
    }
  }, [userData, todaysFocusAreas, todaysMood]);

  const handleExerciseComplete = (result: any) => {
    // Calculate adaptive difficulty for this exercise
    const baseDifficulty = calculateDifficulty(result.exerciseId, userData);
    const adjustedDifficulty = adjustForMood(baseDifficulty, todaysMood);
    
    const enhancedResult = {
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

  const completeSession = (results: any[]) => {
    const sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000 / 60);
    const averageScore = results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length;
    
    if (userData) {
      // Update exercise statistics with adaptive learning
      let updatedUserData = { ...userData };
      results.forEach(result => {
        updatedUserData = updateExerciseStats(updatedUserData, result);
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
            exercises: results,
            mood: todaysMood,
            focusAreas: todaysFocusAreas,
            duration: sessionDuration,
            averageScore
          }
        ].slice(-30) // Keep last 30 sessions
      };
      
      localStorage.setItem('mindbloom-user', JSON.stringify(updatedUserData));
    }

    showSuccess(`Great job! Session completed in ${sessionDuration} minutes.`);
    navigate('/session-complete', { 
      state: { 
        results, 
        duration: sessionDuration, 
        averageScore: Math.round(averageScore) 
      } 
    });
  };

  const skipExercise = () => {
    const skippedResult = {
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

  if (!userData || exercises.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Brain className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-pulse" />
            <p className="text-xl text-gray-700">Preparing your personalized session...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const CurrentExerciseComponent = exercises[currentExercise].component;
  const progress = ((currentExercise) / exercises.length) * 100;
  const currentExerciseData = exercises[currentExercise];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={handleBackToFocusSelection}
              className="px-4 py-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Change Focus Areas
            </Button>
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent">
                Training Session
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="px-3 py-2 text-gray-600 hover:text-gray-800"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Sign Out
            </Button>
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
                  {Math.roun((Date.now() - sessionStartTime) / 1000 / 60)} min
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
        <CurrentExerciseComponent
          key={`${currentExercise}-${Date.now()}`}
          onComplete={handleExerciseComplete}
          mood={todaysMood}
          userPreferences={{
            ...userData,
            difficulty: calculateDifficulty(currentExerciseData.id, userData)
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
    </div>
  );
};

export default Training;