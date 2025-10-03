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
    navigate('/brain-tips');
  };

  const openProgress = () => {
    navigate('/progress');
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
      case 'motivated': return <Zap className="w-5 h-5 text-emerald-600" />;
      case 'okay': return <Smile className="w-5 h-5 text-blue-600" />;
      case 'foggy': return <Coffee className="w-5 h-5 text-amber-600" />;
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={changeFocusAreas}
              className="px-4 py-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Change Focus Areas
            </Button>
            <div className="flex items-center space-x-3">
              <Brain className="h-10 w-10 text-indigo-600" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Activity Dashboard
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={openProgress}
              className="px-4 py-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Progress
            </Button>
            <Button 
              variant="outline" 
              onClick={openBrainTips}
              className="px-4 py-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Brain Tips
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

      <main className="container mx-auto px-4 pb-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Ready for training, {userData.name}! 🧠
            </h2>
            <p className="text-lg text-gray-600">
              Your personalized session is prepared based on your mood and focus areas
            </p>
          </div>

          {/* Today's Training Session - Main Focus */}
          <Card className="border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-3xl flex items-center justify-center text-emerald-800">
                <Target className="w-8 h-8 mr-3" />
                Start Training Session
              </CardTitle>
              <CardDescription className="text-xl text-emerald-700">
                3 adaptive exercises • Personalized for your goals • ~10 minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Big Start Button */}
              <div className="flex justify-center">
                <Button 
                  onClick={startTraining}
                  size="lg"
                  className="text-2xl px-16 py-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                >
                  Begin Training →
                </Button>
              </div>

              {/* Session Configuration */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Today's Focus Areas */}
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-emerald-200">
                  <h3 className="font-semibold text-emerald-800 mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Focus Areas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {todaysFocusAreas.map((areaId, index) => (
                      <Badge 
                        key={index}
                        variant="outline" 
                        className="border-emerald-300 text-emerald-700 bg-emerald-50"
                      >
                        {getFocusAreaLabel(areaId)}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={changeFocusAreas}
                    className="mt-2 text-emerald-600 hover:text-emerald-700"
                  >
                    Change Areas
                  </Button>
                </div>

                {/* Today's Mood */}
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-emerald-200">
                  <h3 className="font-semibold text-emerald-800 mb-3 flex items-center">
                    {getMoodIcon(todaysMood)}
                    <span className="ml-2">Today's Mood</span>
                  </h3>
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="outline" 
                      className="border-emerald-300 text-emerald-700 bg-emerald-50 capitalize text-base px-3 py-1"
                    >
                      {todaysMood}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={changeMood}
                      className="text-emerald-600 hover:text-emerald-700"
                    >
                      Change Mood
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
                  <div className="text-3xl font-bold text-emerald-600 mb-2">
                    {userData.streak || 0}
                  </div>
                  <div className="text-sm text-emerald-700 font-medium">
                    Day Streak
                  </div>
                </div>
                
                <div className="text-center px-4">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {getTodaysProgress()}
                  </div>
                  <div className="text-sm text-purple-700 font-medium">
                    Today's Progress
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 cursor-pointer hover:shadow-lg transition-all group"
              onClick={openProgress}
            >
              <CardContent className="pt-6 pb-6 text-center">
                <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold text-purple-900 mb-2">
                  View Progress
                </h3>
                <p className="text-purple-700">
                  Track your cognitive wellness journey
                </p>
              </CardContent>
            </Card>

            <Card 
              className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 cursor-pointer hover:shadow-lg transition-all group"
              onClick={openBrainTips}
            >
              <CardContent className="pt-6 pb-6 text-center">
                <BookOpen className="w-12 h-12 text-amber-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold text-amber-900 mb-2">
                  Brain Tips
                </h3>
                <p className="text-amber-700">
                  Daily wellness insights & education
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