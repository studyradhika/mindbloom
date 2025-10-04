import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Trophy, Target, Calendar, TrendingUp, ArrowLeft, LogOut, Heart, BookOpen } from "lucide-react";
import { showSuccess } from "@/utils/toast";

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

  if (!results || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      {/* Header */}
      <header className="container mx-auto px-4 mb-8">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="px-3 py-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleSignOut}
            className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 max-w-4xl">
        {/* Main Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Great job completing today's session! 🎉
          </h1>
        </div>

        {/* Top Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Day Streak */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {userData.streak}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Day Streak</p>
            </CardContent>
          </Card>

          {/* Today's Progress */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-6 h-6 text-green-500 mr-2" />
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {Math.round(averageScore)}%
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Today's Progress</p>
            </CardContent>
          </Card>

          {/* Today's Mood */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Heart className="w-6 h-6 text-pink-500 mr-2" />
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {getMoodLabel(todaysMood)}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Today's Mood</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Session Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm mb-8">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center mb-4">
              <Calendar className="w-6 h-6 text-indigo-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Today's Session</h2>
            </div>
            
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">✓</span>
                </div>
                <span className="text-xl font-semibold text-green-600">Session Complete!</span>
              </div>
              
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                You completed {results.length} exercises in {duration} minutes.
              </p>
              
              <div className="flex flex-wrap justify-center gap-3">
                {exerciseNames.map((name, index) => (
                  <Badge 
                    key={index}
                    variant="secondary" 
                    className="text-sm px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* View Progress */}
          <Card 
            className="bg-white dark:bg-gray-800 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/progress')}
          >
            <CardContent className="pt-6 pb-6 text-center">
              <TrendingUp className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                View Progress
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                See your cognitive wellness journey
              </p>
            </CardContent>
          </Card>

          {/* Brain Tips - FIXED NAVIGATION */}
          <Card 
            className="bg-white dark:bg-gray-800 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/brain-tips')}
          >
            <CardContent className="pt-6 pb-6 text-center">
              <BookOpen className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Brain Tips
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Daily wellness insights & education
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Encouragement Banner */}
        <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg">
          <CardContent className="pt-8 pb-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              You're doing great! ⭐
            </h3>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Every session is a step forward in your cognitive wellness journey. Remember, consistency matters more than perfection.
            </p>
          </CardContent>
        </Card>

        {/* Return to Dashboard Button */}
        <div className="text-center mt-8">
          <Button 
            onClick={() => navigate('/dashboard')}
            size="lg"
            className="text-xl px-8 py-4 bg-indigo-600 hover:bg-indigo-700"
          >
            Return to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SessionComplete;