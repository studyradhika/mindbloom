import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, Smile, Meh, Frown, Zap, Coffee, BookOpen, BarChart3, LogOut, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { theme, getAreaColor } from "@/lib/theme";
import { getPreviousPage } from "@/lib/navigation";
import MoodSelector from "@/components/MoodSelector";
import ProfileSettingsButton from "@/components/ProfileSettingsButton"; // Import the new component

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
    navigate('/focus-selection');
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

  const openMemoryTools = () => {
    navigate('/memory-tools');
  };

  const changeFocusAreas = () => {
    navigate('/focus-selection');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50">
      {/* Header - Updated Layout */}
      <header className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          {/* LEFT: Change Focus Areas Button (goes to focus selection) */}
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="px-4 py-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Change Focus Areas
          </Button>
          
          {/* CENTER: MindBloom Branding */}
          <div className="flex items-center space-x-3">
            <Brain className="h-10 w-10 text-indigo-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent">
              Activity Dashboard
            </h1>
          </div>
          
          {/* RIGHT: User Name, Settings, and Sign Out Button */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Hello, {userData.name}!</span>
            <ProfileSettingsButton /> {/* Add the settings button here */}
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

      <main className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto space-y-10">
          
          {/* Today's Training Session - Main Focus */}
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-teal-50 shadow-lg">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-4xl flex items-center justify-center text-blue-800 mb-4">
                <Target className="w-10 w-10 mr-4" />
                Let's begin your training session
              </CardTitle>
              <CardDescription className="text-xl text-blue-700">
                3 adaptive exercises • Personalized for your goals • ~10 minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pb-8">
              {/* Big Start Button */}
              <div className="flex justify-center py-8">
                <Button 
                  onClick={startTraining}
                  size="lg"
                  className="text-2xl px-24 py-12 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                >
                  Begin Training →
                </Button>
              </div>

              {/* Today's Focus Areas */}
              <div className="border-t border-blue-200 pt-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Today's focus:</span>
                    <div className="flex flex-wrap gap-1">
                      {todaysFocusAreas.map((areaId, index) => (
                        <Badge 
                          key={index}
                          variant="outline" 
                          className="text-xs px-2 py-1 border-gray-300 text-gray-600 bg-gray-50"
                        >
                          {getFocusAreaLabel(areaId)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={changeFocusAreas}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 h-auto"
                  >
                    Change Focus Area
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Overview - De-emphasized */}
          <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm">
            <div className="pt-4 pb-4 px-6">
              <div className="grid grid-cols-3 divide-x divide-gray-200">
                <div className="text-center px-3">
                  <div className="text-xl font-semibold text-gray-700 mb-1">
                    {userData.totalSessions || 0}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    Total Sessions
                  </div>
                </div>
                
                <div className="text-center px-3">
                  <div className="text-xl font-semibold text-gray-700 mb-1">
                    {userData.streak || 0}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    Day Streak
                  </div>
                </div>
                
                <div className="text-center px-3">
                  <div className="text-xl font-semibold text-gray-700 mb-1">
                    {getTodaysProgress()}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    Today's Progress
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card 
              className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 cursor-pointer hover:shadow-lg transition-all group"
              onClick={openProgress}
            >
              <CardContent className="pt-10 pb-10 text-center">
                <BarChart3 className="w-16 h-16 text-indigo-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-semibold text-indigo-900 mb-3">
                  View Progress
                </h3>
                <p className="text-lg text-indigo-700">
                  Track your cognitive wellness journey
                </p>
              </CardContent>
            </Card>

            <Card 
              className="border-blue-200 bg-gradient-to-r from-blue-50 to-teal-50 cursor-pointer hover:shadow-lg transition-all group"
              onClick={openBrainTips}
            >
              <CardContent className="pt-10 pb-10 text-center">
                <BookOpen className="w-16 h-16 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-semibold text-blue-900 mb-3">
                  Brain Tips
                </h3>
                <p className="text-lg text-blue-700">
                  Daily wellness insights & education
                </p>
              </CardContent>
            </Card>

            <Card 
              className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer hover:shadow-lg transition-all group"
              onClick={openMemoryTools}
            >
              <CardContent className="pt-10 pb-10 text-center">
                <Brain className="w-16 h-16 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-semibold text-blue-900 mb-3">
                  Memory Tools
                </h3>
                <p className="text-lg text-blue-700">
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