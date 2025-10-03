import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Clock, ArrowRight, Home, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { showSuccess } from "@/utils/toast";
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

  // Exercise mapping based on focus areas
  const getExerciseSet = () => {
    const exerciseMap: { [key: string]: any } = {
      memory: {
        id: 'memory',
        title: 'Memory Challenge',
        description: 'Remember and recall sequences',
        component: MemoryExercise,
        area: 'Memory'
      },
      attention: {
        id: 'attention',
        title: 'Focus Training',
        description: 'Selective attention and concentration',
        component: AttentionExercise,
        area: 'Attention'
      },
      language: {
        id: 'language',
        title: 'Word Skills',
        description: 'Language and verbal reasoning',
        component: LanguageExercise,
        area: 'Language'
      },
      executive: {
        id: 'sequencing',
        title: 'Task Sequencing',
        description: 'Organize everyday activities in order',
        component: SequencingExercise,
        area: 'Executive Function'
      },
      creativity: {
        id: 'mindful-memory',
        title: 'Mindful Memory',
        description: 'Memory training with guided breathing',
        component: MindfulMemoryExercise,
        area: 'Creativity & Mindfulness'
      },
      processing: {
        id: 'attention',
        title: 'Processing Speed',
        description: 'Quick thinking and reaction time',
        component: AttentionExercise,
        area: 'Processing Speed'
      },
      spatial: {
        id: 'memory',
        title: 'Spatial Memory',
        description: 'Visual-spatial memory patterns',
        component: MemoryExercise,
        area: 'Spatial Reasoning'
      },
      perception: {
        id: 'attention',
        title: 'Visual Perception',
        description: 'Pattern recognition and visual processing',
        component: AttentionExercise,
        area: 'Perception'
      },
      general: {
        id: 'conversation',
        title: 'Social Skills',
        description: 'Real-world conversation practice',
        component: ConversationExercise,
        area: 'General Wellness'
      }
    };

    let selectedExercises: any[] = [];

    // Map focus areas to exercises
    todaysFocusAreas.forEach(areaId => {
      if (exerciseMap[areaId] && selectedExercises.length < 3) {
        selectedExercises.push(exerciseMap[areaId]);
      }
    });

    // Fill remaining slots with default exercises if needed
    const defaultExercises = [
      exerciseMap.memory,
      exerciseMap.attention,
      exerciseMap.language
    ];

    while (selectedExercises.length < 3) {
      const defaultEx = defaultExercises[selectedExercises.length];
      if (!selectedExercises.find(ex => ex.id === defaultEx.id)) {
        selectedExercises.push(defaultEx);
      }
    }

    // Ensure we have exactly 3 unique exercises
    const uniqueExercises = selectedExercises.filter((exercise, index, self) => 
      index === self.findIndex(ex => ex.id === exercise.id)
    ).slice(0, 3);

    return uniqueExercises;
  };

  const [exercises, setExercises] = useState<any[]>([]);

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
    const newResults = [...exerciseResults, result];
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
    
    // Update user data with enhanced tracking
    if (userData) {
      const updatedData = {
        ...userData,
        totalSessions: (userData.totalSessions || 0) + 1,
        streak: (userData.streak || 0) + 1,
        lastSessionDate: new Date().toISOString(),
        lastSessionScore: averageScore,
        lastSessionDuration: sessionDuration,
        lastSessionMood: todaysMood,
        lastSessionFocusAreas: todaysFocusAreas,
        exerciseHistory: [
          ...(userData.exerciseHistory || []),
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
      
      localStorage.setItem('mindbloom-user', JSON.stringify(updatedData));
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
      timeSpent: 0
    };
    handleExerciseComplete(skippedResult);
  };

  const restartExercise = () => {
    // Force re-render of current exercise
    setCurrentExercise(currentExercise);
  };

  if (!userData || exercises.length === 0) {
    return <div>Loading...</div>;
  }

  const CurrentExerciseComponent = exercises[currentExercise].component;
  const progress = ((currentExercise) / exercises.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Training Session</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2"
          >
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="container mx-auto px-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                Exercise {currentExercise + 1} of {exercises.length}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {Math.round((Date.now() - sessionStartTime) / 1000 / 60)} min
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Exercise Content */}
      <div className="container mx-auto px-4">
        <CurrentExerciseComponent
          key={`${currentExercise}-${Date.now()}`} // Force re-render on restart
          onComplete={handleExerciseComplete}
          mood={todaysMood}
          userPreferences={userData}
        />
      </div>

      {/* Exercise Controls */}
      <div className="container mx-auto px-4 mt-6 pb-8">
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={restartExercise}
            className="px-6 py-3"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart Exercise
          </Button>
          
          <Button
            variant="outline"
            onClick={skipExercise}
            className="px-6 py-3"
          >
            Skip Exercise
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        
        <div className="text-center mt-4">
          <p className="text-gray-600 dark:text-gray-400">
            Need a rest? Come back tomorrow—your progress is saved!
          </p>
        </div>
      </div>

      {/* Exercise Preview */}
      <div className="container mx-auto px-4 pb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Personalized Session</CardTitle>
            <CardDescription>
              Based on your focus areas: {todaysFocusAreas.map(area => area.charAt(0).toUpperCase() + area.slice(1)).join(', ')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {exercises.map((exercise, index) => (
                <div 
                  key={exercise.id}
                  className={`p-3 rounded-lg border-2 ${
                    index === currentExercise 
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                      : index < currentExercise 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{exercise.title}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{exercise.area}</p>
                    </div>
                    <div className="text-xs">
                      {index < currentExercise ? '✓' : index === currentExercise ? '→' : '○'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Training;