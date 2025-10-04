import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, Smile, Meh, Frown, Zap, Coffee, BookOpen, BarChart3, LogOut, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { theme, getAreaColor } from "@/lib/theme";
import { getPreviousPage } from "@/lib/navigation";
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
      
      const today = new Date().toDateString();
      const lastMoodDate = localStorage.getItem('mindbloom-last-mood-date');
      const lastFocusDate = localStorage.getItem('mindbloom-last-focus-date');
      const storedMood = localStorage.getItem('mindbloom-today-mood');
      const storedFocusAreas = localStorage.getItem('mindbloom-today-focus-areas');
      
      // Check if we need to show mood selector
      if (lastMoodDate !== today || !storedMood) {
        setShowMoodSelector(true);
        return;
      }
      
      // Check if we need to redirect to focus selection
      if (lastFocusDate !== today || !storedFocusAreas) {
        navigate('/focus-selection');
        return;
      }
      
      // Both mood and focus areas are set for today
      setTodaysMood(storedMood);
      setTodaysFocusAreas(JSON.parse(storedFocusAreas));
    } else {
      navigate('/onboarding');
    }
  }, [navigate]);

  const handleMoodSelected = (mood: string) => {
    setTodaysMood(mood);
    setShowMoodSelector(false);
    
    const today = new Date().toDateString();
    localStorage.setItem('mindbloom-today-mood', mood);
    localStorage.setItem('mindbloom-last-mood-date', today);
    
    // After mood is selected, go to focus selection
    navigate('/focus-selection');
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

  const handleBack = () => {
    const previousPage = getPreviousPage('/dashboard');
    navigate(previousPage);
  };

  const startTraining = () => {
    navigate('/training');
  };

  const openBrainTips = () => {
    console.log('Navigating to Brain Tips page...');
    navigate('/brain-tips');
  };

  const openProgress = () => {
    navigate('/progress');
  };

  const openMemoryTools = () => {
    console.log('Navigating to Memory Tools page...');
    navigate('/memory-tools');
  };

  const changeFocusAreas = () => {
    navigate('/focus-selection');
  };

  const changeMood = () => {
    // Clear mood data and show mood selector
    localStorage.removeItem('mindbloom-today-mood');
    localStorage.removeItem('mindbloom-last-mood-date');
    setShowMoodSelector(true);
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'motivated': return <Zap className="w-5 h-5 text-teal-600" />;
      case 'okay': return <Smile className="w-5 h-5 text-blue-600" />;
      case 'foggy': return <Coffee className="w-5 h-5 text-indigo-600" />;
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

  const getTodaysProgress = () => {
    const exerciseHistory = userData.exerciseHistory || [];
    const today = new Date().toDateString();
    
    const todaySession = exerciseHistory.find((session: any) => {
      const sessionDate = new Date(session.date).toDateString();
      return sessionDate === today;
    });
    
    if (todaySession && todaySession.exercises) {
      const completedCount = todaySession.exercises.filter((ex: any) => !ex.skipped && ex.score !== undefined).length;
      const totalCount = todaySession.exercises.length;
      return `${completedCount}/${totalCount}`;
    }
    
    return `0/3`;
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Brain className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-pulse" />
            <p className="text-xl text-gray-700">Loading your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show mood selector if needed
  if (showMoodSelector) {
    return <MoodSelector onMoodSelected={handleMoodSelected} userName={userData.name} />;
  }

  // If we don't have mood or focus areas, we're in the wrong state
  if (!todaysMood || todaysFocusAreas.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Brain className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-pulse" />
            <p className="text-xl text-gray-700">Setting up your session...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // This is now the Activity Dashboard - showing training session ready to start
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          {/* Left: Change Focus Areas Button */}
          <Button 
            variant="outline" 
            onClick={changeFocusAreas}
            className="px-4 py-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Change Focus Areas
          </Button>
          
          {/* Center: Brain Icon + Activity Dashboard Text */}
          <div className="flex items-center space-x-3">
            <Brain className="h-10 w-10 text-indigo-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent">
              Activity Dashboard
            </h1>
          </div>
          
          {/* Right: Sign Out Button Only */}
          <Button 
            variant="ghost" 
            onClick={handleSignOut}
            className="px-3 py-2 text-gray-600 hover:text-gray-800"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Today's Training Session - Main Focus */}
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-teal-50 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-3xl flex items-center justify-center text-blue-800">
                <Target className="w-8 h-8 mr-3" />
                Let's begin your training session
              </CardTitle>
              <CardDescription className="text-xl text-blue-700">
                3 adaptive exercises • Personalized for your goals • ~10 minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Big Start Button */}
              <div className="flex justify-center">
                <Button 
                  onClick={startTraining}
                  size="lg"
                  className="text-2xl px-16 py-8 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                >
                  Begin Training →
                </Button>
              </div>

              {/* Centered Focus Areas */}
              <div className="flex justify-center">
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-teal-50 rounded-lg p-4 border border-blue-200 max-w-md w-full">
                  <h3 className="font-semibold text-blue-800 mb-3 flex items-center justify-center">
                    <Target className="w-5 h-5 mr-2" />
                    Today's Focus Areas
                  </h3>
                  <div className="flex flex-wrap justify-center gap-2 mb-3">
                    {todaysFocusAreas.map((areaId, index) => (
                      <Badge 
                        key={index}
                        variant="outline" 
                        className="border-blue-300 text-blue-700 bg-blue-50"
                      >
                        {getFocusAreaLabel(areaId)}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={changeFocusAreas}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Change Areas
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-lg">
            <CardContent className="pt-8 pb-8">
              <div className="grid grid-cols-3 divide-x divide-indigo-200">
                <div className="text-center px-4">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">
                    {userData.totalSessions || 0}
                  </div>
                  <div className="text-sm text-indigo-700 font-medium">
                    Total Sessions
                  </div>
                </div>
                
                <div className="text-center px-4">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {userData.streak || 0}
                  </div>
                  <div className="text-sm text-blue-700 font-medium">
                    Day Streak
                  </div>
                </div>
                
                <div className="text-center px-4">
                  <div className="text-3xl font-bold text-teal-600 mb-2">
                    {getTodaysProgress()}
                  </div>
                  <div className="text-sm text-teal-700 font-medium">
                    Today's Progress
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card 
              className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 cursor-pointer hover:shadow-lg transition-all group"
              onClick={openProgress}
            >
              <CardContent className="pt-4 pb-4 text-center">
                <BarChart3 className="w-12 h-12 text-indigo-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold text-indigo-900 mb-1">
                  View Progress
                </h3>
                <p className="text-indigo-700">
                  Track your cognitive wellness journey
                </p>
              </CardContent>
            </Card>

            <Card 
              className="border-blue-200 bg-gradient-to-r from-blue-50 to-teal-50 cursor-pointer hover:shadow-lg transition-all group"
              onClick={openBrainTips}
            >
              <CardContent className="pt-4 pb-4 text-center">
                <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold text-blue-900 mb-1">
                  Brain Tips
                </h3>
                <p className="text-blue-700">
                  Daily wellness insights & education
                </p>
              </CardContent>
            </Card>

            <Card 
              className="border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 cursor-pointer hover:shadow-lg transition-all group"
              onClick={openMemoryTools}
            >
              <CardContent className="pt-4 pb-4 text-center">
                <Brain className="w-12 h-12 text-teal-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold text-teal-900 mb-1">
                  Memory Tools
                </h3>
                <p className="text-teal-700">
                  Notes, checklists & reminders
                </p>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;