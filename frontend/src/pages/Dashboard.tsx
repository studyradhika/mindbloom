import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, Smile, Meh, Frown, Zap, Coffee, BookOpen, CheckSquare, Heart, MessageCircle, BarChart3, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MoodSelector from "@/components/MoodSelector";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [todaysMood, setTodaysMood] = useState<string>('');
  const [showMoodSelector, setShowMoodSelector] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem('mindbloom-user');
    if (storedData) {
      const data = JSON.parse(storedData);
      setUserData(data);
      
      // Check if mood was already set today
      const today = new Date().toDateString();
      const lastMoodDate = localStorage.getItem('mindbloom-last-mood-date');
      const storedMood = localStorage.getItem('mindbloom-today-mood');
      
      if (lastMoodDate === today && storedMood) {
        setTodaysMood(storedMood);
      } else {
        setShowMoodSelector(true);
      }
    } else {
      navigate('/onboarding');
    }
  }, [navigate]);

  const handleMoodSelected = (mood: string) => {
    setTodaysMood(mood);
    setShowMoodSelector(false);
    
    // Store mood for today
    const today = new Date().toDateString();
    localStorage.setItem('mindbloom-today-mood', mood);
    localStorage.setItem('mindbloom-last-mood-date', today);
  };

  const startTraining = () => {
    navigate('/training');
  };

  const openMemoryTools = () => {
    navigate('/memory-tools');
  };

  const openProgress = () => {
    navigate('/progress');
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'motivated': return <Zap className="w-5 h-5 text-green-600" />;
      case 'okay': return <Smile className="w-5 h-5 text-blue-600" />;
      case 'foggy': return <Coffee className="w-5 h-5 text-orange-600" />;
      case 'tired': return <Meh className="w-5 h-5 text-gray-600" />;
      case 'stressed': return <Frown className="w-5 h-5 text-red-600" />;
      default: return <Smile className="w-5 h-5 text-blue-600" />;
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'motivated': return 'bg-green-100 text-green-800 border-green-200';
      case 'okay': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'foggy': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'tired': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'stressed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getExerciseCount = () => {
    // Always return 3 exercises per day
    return 3;
  };

  const getAvailableExerciseTypes = () => {
    // Start with core exercises (removed Memory)
    const types = ['Attention', 'Language'];
    
    // Always add one specialized exercise based on mood and user profile
    if (userData?.goals?.includes('stress') || 
        todaysMood === 'stressed' || 
        todaysMood === 'foggy' || 
        todaysMood === 'tired' ||
        userData?.goals?.includes('recovery')) {
      // Add Mindful Memory for stressed/recovery users
      types.push('Mindful Memory');
    } else if (userData?.goals?.includes('recovery') || 
               userData?.goals?.includes('professional') ||
               userData?.cognitiveAreas?.includes('executive') ||
               userData?.experience === 'experienced') {
      // Add Task Sequencing for executive function focus
      types.push('Task Sequencing');
    } else if (userData?.goals?.includes('professional') ||
               userData?.experience === 'experienced' ||
               todaysMood === 'motivated') {
      // Add Conversation Practice for social skills
      types.push('Conversation Practice');
    } else {
      // Default to Task Sequencing if no specific conditions are met
      types.push('Task Sequencing');
    }
    
    return types;
  };

  const showConversationPractice = () => {
    const exerciseTypes = getAvailableExerciseTypes();
    return exerciseTypes.includes('Conversation Practice');
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  if (showMoodSelector) {
    return <MoodSelector onMoodSelected={handleMoodSelected} userName={userData.name} />;
  }

  const exerciseTypes = getAvailableExerciseTypes();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MindBloom</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={openProgress}
              className="text-base px-3 py-2"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Progress
            </Button>
            <Button 
              variant="outline" 
              onClick={openMemoryTools}
              className="text-base px-3 py-2"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Memory Tools
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowMoodSelector(true)}
              className="text-base px-3 py-2"
            >
              Change Mood
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Today's Brain Training */}
          <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center">
                <Target className="w-6 h-6 mr-2 text-green-600" />
                Let's begin today's brain training
              </CardTitle>
              <CardDescription className="text-lg">
                {getExerciseCount()} quick activities picked just for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-center">
                {/* Start Button */}
                <div className="flex justify-center">
                  <Button 
                    onClick={startTraining}
                    size="lg"
                    className="text-xl px-8 py-4 bg-green-600 hover:bg-green-700"
                  >
                    Start Now
                  </Button>
                </div>

                {/* Exercise Types Preview */}
                <div className="bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-800/30 dark:to-green-800/30 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Today's Exercise Types:</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {exerciseTypes.map((type, index) => (
                      <Badge 
                        key={index}
                        variant="outline" 
                        className="text-sm px-3 py-1 flex items-center space-x-1"
                      >
                        {type === 'Mindful Memory' && <Heart className="w-3 h-3" />}
                        {type === 'Conversation Practice' && <MessageCircle className="w-3 h-3" />}
                        {type === 'Task Sequencing' && <CheckSquare className="w-3 h-3" />}
                        {!['Mindful Memory', 'Conversation Practice', 'Task Sequencing'].includes(type) && <Brain className="w-3 h-3" />}
                        <span>{type}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversation Practice Info (only if available) */}
          {showConversationPractice() && (
            <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-purple-600" />
                  Conversation Practice Available Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-700 dark:text-purple-300 mb-4">
                  Real-world social scenarios to build confidence in everyday interactions like doctor appointments, 
                  grocery shopping, and friendly conversations with neighbors.
                </p>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    💡 This exercise helps you practice social communication in a safe, supportive environment
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Metrics - Single Card with Horizontal Layout */}
          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="flex divide-x divide-gray-200 dark:divide-gray-700">
                <div className="flex-1 text-center px-4">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {userData.totalSessions || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Exercises Done
                  </div>
                </div>
                
                <div className="flex-1 text-center px-4">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {userData.streak || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Day Streak
                  </div>
                </div>
                
                <div className="flex-1 text-center px-4">
                  <div className="text-3xl font-bold text-orange-600 mb-1">
                    {getExerciseCount()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Today's Goal
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;