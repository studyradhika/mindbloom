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

  // Enhanced exercise selection based on user goals and mood
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

    const advancedExercises = [
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

    // Add advanced exercises based on user goals and mood
    if (userData?.goals?.includes('recovery') || userData?.goals?.includes('professional')) {
      selectedExercises.push(advancedExercises[0]); // Sequencing
    }

    if (userData?.goals?.includes('stress') || todaysMood === 'stressed' || todaysMood === 'foggy') {
      selectedExercises.push(advancedExercises[1]); // Mindful Memory
    }

    if (userData?.goals?.includes('recovery') || userData?.experience === 'experienced') {
      selectedExercises.push(advancedExercises[2]); // Conversation
    }

    // Limit exercises based on mood
    if (todaysMood === 'tired' || todaysMood === 'stressed') {
      selectedExercises = selectedExercises.slice(0, 3);
    } else if (todaysMood === 'motivated') {
      // Include more exercises for motivated users
      selectedExercises = [...baseExercises, ...advancedExercises].slice(0, 5);
    }

    return selectedExercises;
  };

  const [exercises] = useState(getExerciseSet());

  useEffect(() => {
    const storedData = localStorage.getItem('mindbloom-user');
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
    
    const mood = localStorage.getItem('mindbloom-today-mood') || 'okay';
    setTodaysMood(mood);
  }, []);

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

  if (!userData) {
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
    </div>
  );
};

export default Training;