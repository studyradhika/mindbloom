import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Trophy, Target, Calendar, TrendingUp, ArrowLeft, LogOut, Heart, BookOpen } from "lucide-react";
import { showSuccess } from "@/utils/toast";
import ProfileSettingsButton from "@/components/ProfileSettingsButton"; // Import the new component

const SessionComplete = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const { results, duration, averageScore } = location.state || {};

  useEffect(() => {
    const storedData = localStorage.getItem('mindbloom-user');
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
  }, []);

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
    
    navigate('/goodbye');
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'motivated': return '⚡';
      case 'okay': return '😊';
      case 'foggy': return '🌫️';
      case 'tired': return '😴';
      case 'stressed': return '😰';
      default: return '😊';
    }
  };

  const getMoodLabel = (mood: string) => {
    switch (mood) {
      case 'motivated': return 'Motivated';
      case 'okay': return 'Okay';
      case 'foggy': return 'Foggy';
      case 'tired': return 'Tired';
      case 'stressed': return 'Stressed';
      default: return 'Okay';
    }
  };

  const getExerciseNames = () => {
    if (!results) return [];
    
    const exerciseNames: { [key: string]: string } = {
      memory: 'Memory Training',
      attention: 'Attention Training',
      language: 'Word Skills',
      sequencing: 'Task Sequencing',
      'mindful-memory': 'Mindful Memory',
      conversation: 'Social Skills'
    };

    return results.map((result: any) => 
      exerciseNames[result.exerciseId] || result.exerciseId
    );
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

  if (!results || !userData) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <p>Loading results...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const todaysMood = localStorage.getItem('mindbloom-today-mood') || 'okay';
  const exerciseNames = getExerciseNames();

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col overflow-hidden">
      {/* Compact Header with Centered MindBloom Branding */}
      <header className="flex-shrink-0 container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Dashboard Button - Left */}
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="px-3 py-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          {/* MindBloom Branding - Center */}
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              MindBloom
            </h1>
          </div>
          
          {/* Sign Out Button - Right */}
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
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <main className="flex-1 container mx-auto px-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* Celebration Title - Compact */}
          <div className="text-center py-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Great job completing today's session! 🎉
            </h2>
          </div>

          {/* Stats Overview - Single Row */}
          <Card className="bg-white shadow-sm">
            <CardContent className="py-4">
              <div className="grid grid-cols-4 divide-x divide-gray-200">
                <div className="text-center px-3">
                  <div className="flex items-center justify-center mb-1">
                    <Trophy className="w-5 h-5 text-yellow-500 mr-1" />
                    <span className="text-2xl font-bold text-gray-900">
                      {userData.streak}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Day Streak</p>
                </div>

                <div className="text-center px-3">
                  <div className="flex items-center justify-center mb-1">
                    <Target className="w-5 h-5 text-green-500 mr-1" />
                    <span className="text-2xl font-bold text-gray-900">
                      {Math.round(averageScore)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Today's Score</p>
                </div>

                <div className="text-center px-3">
                  <div className="flex items-center justify-center mb-1">
                    <Calendar className="w-5 h-5 text-blue-500 mr-1" />
                    <span className="text-2xl font-bold text-gray-900">
                      {results.length}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Exercises</p>
                </div>

                <div className="text-center px-3">
                  <div className="flex items-center justify-center mb-1">
                    <Heart className="w-5 h-5 text-pink-500 mr-1" />
                    <span className="text-2xl font-bold text-gray-900">
                      {getMoodLabel(todaysMood)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Today's Mood</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Summary - Compact */}
          <Card className="bg-white shadow-sm">
            <CardContent className="py-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white font-bold text-sm">✓</span>
                  </div>
                  <span className="text-lg font-semibold text-green-600">Session Complete!</span>
                </div>
                
                <p className="text-gray-700 mb-3">
                  Completed in {duration} minutes
                </p>
                
                <div className="flex flex-wrap justify-center gap-2">
                  {exerciseNames.map((name, index) => (
                    <Badge 
                      key={index}
                      variant="secondary" 
                      className="text-xs px-3 py-1 bg-gray-100 text-gray-700"
                    >
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Cards - Compact Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card 
              className="bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
              onClick={() => navigate('/progress')}
            >
              <CardContent className="py-4 text-center">
                <TrendingUp className="w-10 h-10 text-blue-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  View Progress
                </h3>
                <p className="text-sm text-gray-600">
                  Track your cognitive wellness journey
                </p>
              </CardContent>
            </Card>

            <Card 
              className="bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
              onClick={() => navigate('/brain-tips')}
            >
              <CardContent className="py-4 text-center">
                <BookOpen className="w-10 h-10 text-purple-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Brain Tips
                </h3>
                <p className="text-sm text-gray-600">
                  Daily wellness insights & education
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Encouragement Banner - Compact */}
          <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg">
            <CardContent className="py-4 text-center">
              <h3 className="text-xl font-bold mb-2">
                You're doing great! ⭐
              </h3>
              <p className="text-sm opacity-90">
                Every session is a step forward in your cognitive wellness journey.
              </p>
            </CardContent>
          </Card>

          {/* Return Button */}
          <div className="text-center pb-4">
            <Button 
              onClick={() => navigate('/dashboard')}
              size="lg"
              className="text-lg px-8 py-3 bg-indigo-600 hover:bg-indigo-700"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SessionComplete;