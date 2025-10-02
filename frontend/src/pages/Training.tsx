import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  // Enhanced exercise selection with better availability
  const getExerciseSet = () => {
    const baseExercises = [
      {
        id: 'memory',
        title: 'Memory Challenge',
        description: 'Remember and recall sequences',
        component: MemoryExercise,
        area: 'Memory'
      },
      {
        id: 'attention',
        title: 'Focus Training',
        description: 'Selective attention and concentration',
        component: AttentionExercise,
        area: 'Attention'
      },
      {
        id: 'language',
        title: 'Word Skills',
        description: 'Language and verbal reasoning',
        component: LanguageExercise,
        area: 'Language'
      }
    ];

    const specializedExercises = [
      {
        id: 'sequencing',
        title: 'Task Sequencing',
        description: 'Organize everyday activities in order',
        component: SequencingExercise,
        area: 'Executive Function'
      },
      {
        id: 'mindful-memory',
        title: 'Mindful Memory',
        description: 'Memory training with guided breathing',
        component: MindfulMemoryExercise,
        area: 'Mindful Cognitive'
      },
      {
        id: 'conversation',
        title: 'Conversation Practice',
        description: 'Real-world social interactions',
        component: ConversationExercise,
        area: 'Social Communication'
      }
    ];

    let selectedExercises = [...baseExercises];

    // Always include mindful memory for stress management and holistic wellness
    if (userData?.goals?.includes('stress') || 
        todaysMood === 'stressed' || 
        todaysMood === 'foggy' || 
        todaysMood === 'tired' ||
        userData?.goals?.includes('recovery')) {
      selectedExercises.push(specializedExercises[1]); // Mindful Memory
    }

    // Include sequencing for executive function and daily living skills
    if (userData?.goals?.includes('recovery') || 
        userData?.goals?.includes('professional') ||
        userData?.cognitiveAreas?.includes('executive') ||
        userData?.experience === 'experienced') {
      selectedExercises.push(specializedExercises[0]); // Sequencing
    }

    // Include conversation practice for social skills and recovery
    if (userData?.goals?.includes('recovery') || 
        userData?.goals?.includes('professional') ||
        userData?.experience === 'experienced' ||
        todaysMood === 'motivated') {
      selectedExercises.push(specializedExercises[2]); // Conversation
    }

    // For motivated users, include more exercises
    if (todaysMood === 'motivated') {
      // Add any missing specialized exercises
      specializedExercises.forEach(exercise => {
        if (!selectedExercises.find(e => e.id === exercise.id)) {
          selectedExercises.push(exercise);
        }
      });
      selectedExercises = selectedExercises.slice(0, 6); // Max 6 exercises
    }

    // For tired/stressed users, limit but still include mindful exercises
    if (todaysMood === 'tired' || todaysMood === 'stressed') {
      // Ensure mindful memory is included for these moods
      if (!selectedExercises.find(e => e.id === 'mindful-memory')) {
        selectedExercises.push(specializedExercises[1]);
      }
      selectedExercises = selectedExercises.slice(0, 4); // Limit to 4 exercises
    }

    // Ensure we always have at least the base exercises
    if (selectedExercises.length < 3) {
      selectedExercises = [...baseExercises];
    }

    return selectedExercises;
  };

  const [exercises, setExercises] = useState<any[]>([]);

  useEffect(() => {
    const storedData = localStorage.getItem('mindbloom-user');
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
    
    const mood = localStorage.getItem('mindbloom-today-mood') || 'okay';
    setTodaysMood(mood);
  }, []);

  useEffect(() => {
    if (userData) {
      setExercises(getExerciseSet());
    }
  }, [userData, todaysMood]);

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
        exerciseHistory: [
          ...(userData.exerciseHistory || []),
          {
            date: new Date().toISOString(),
            exercises: results,
            mood: todaysMood,
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
            <Progress value={progress} className="h-2 mb-2" />
            <div className="text-center">
              <h2 className="text-lg font-semibold">{exercises[currentExercise].title}</h2>
              <p className="text-gray-600 dark:text-gray-400">{exercises[currentExercise].description}</p>
              <div className="mt-2">
                <Badge variant="outline" className="text-sm">
                  {exercises[currentExercise].area}
                </Badge>
              </div>
            </div>
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
            <CardTitle className="text-lg">Today's Exercise Plan</CardTitle>
            <CardDescription>
              Your personalized session based on mood: {todaysMood}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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