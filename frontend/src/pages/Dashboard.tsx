import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, Smile, Meh, Frown, Zap, Coffee, BookOpen, CheckSquare, Heart, MessageCircle, BarChart3, Calendar, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MoodSelector from "@/components/MoodSelector";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [todaysMood, setTodaysMood] = useState<string>('');
  const [todaysFocusAreas, setTodaysFocusAreas] = useState<string[]>([]);
  const [showMoodSelector, setShowMoodSelector] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem('mindbloom-user');
    if (storedData) {
      const data = JSON.parse(storedData);
      setUserData(data);
      
      // Check if mood and focus areas are set for today
      const today = new Date().toDateString();
      const lastMoodDate = localStorage.getItem('mindbloom-last-mood-date');
      const lastFocusDate = localStorage.getItem('mindbloom-last-focus-date');
      const storedMood = localStorage.getItem('mindbloom-today-mood');
      const storedFocusAreas = localStorage.getItem('mindbloom-today-focus-areas');
      
      if (lastMoodDate === today && storedMood) {
        setTodaysMood(storedMood);
        
        if (lastFocusDate === today && storedFocusAreas) {
          setTodaysFocusAreas(JSON.parse(storedFocusAreas));
        } else {
          // Mood is set but focus areas aren't - redirect to focus selection
          navigate('/focus-selection');
          return;
        }
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
    
    // Navigate to focus selection
    navigate('/focus-selection');
  };

  const handleSignOut = () => {
    // Clear all user data
    localStorage.removeItem('mindbloom-user');
    localStorage.removeItem('mindbloom-today-mood');
    localStorage.removeItem('mindbloom-last-mood-date');
    localStorage.removeItem('mindbloom-today-focus-areas');
    localStorage.removeItem('mindbloom-last-focus-date');
    localStorage.removeItem('mindbloom-notes');
    localStorage.removeItem('mindbloom-checklists');
    localStorage.removeItem('mindbloom-reminders');
    
    // Navigate to sign out page
    navigate('/goodbye');
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

  const changeFocusAreas = () => {
    navigate('/focus-selection');
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

  const getFocusAreaLabel = (areaId: string) => {
    const labels: { [key: string]: string } = {
      general: 'General Wellness',
      attention: 'Attention',
      perception: 'Perception',
      memory: 'Memory',
      language: 'Language',
      executive: 'Executive Function',
      spatial: 'Spatial Reasoning',
      processing: 'Processing Speed',
      creativity: 'Creativity'
    };
    return labels[areaId] || areaId;
  };

  const getExerciseCount = () => {
    // Always return 3 exercises per day
    return 3;
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  if (showMoodSelector) {
    return <MoodSelector onMoodSelected={handleMoodSelected} userName={userData.name} />;
  }

  // If we don't have both mood and focus areas, redirect
  if (!todaysMood || todaysFocusAreas.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MindBloom</h1>
            </div>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-0 h-auto font-normal"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Sign out
            </Button>
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
              onClick={changeFocusAreas}
              className="text-base px-3 py-2"
            >
              <Target className="w-4 h-4 mr-2" />
              Change Focus Areas
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

      <main className="container mx-auto px-4 pb-8 pt-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Today's Brain Training */}
          <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center">
                <Target className="w-6 h-6 mr-2 text-green-600" />
                Let's begin today's brain training
              </CardTitle>
              <CardDescription className="text-lg">
                {getExerciseCount()} activities focused on your selected areas
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

                {/* Today's Focus Areas */}
                <div className="bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-800/30 dark:to-green-800/30 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Today's Focus Areas:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {todaysFocusAreas.map((areaId, index) => (
                      <Badge 
                        key={index}
                        variant="outline" 
                        className="text-sm px-3 py-1"
                      >
                        {getFocusAreaLabel(areaId)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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