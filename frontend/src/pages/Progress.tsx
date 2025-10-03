import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Home, Calendar, TrendingUp, Trophy, Target, LogOut, ArrowLeft } from "lucide-react";
import PerformanceChart from "@/components/PerformanceChart";

const Progress = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('mindbloom-user');
    if (storedData) {
      setUserData(JSON.parse(storedData));
    } else {
      navigate('/onboarding');
    }
  }, [navigate]);

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

  if (!userData) {
    return <div>Loading...</div>;
  }

  const totalSessions = userData.totalSessions || 0;
  const currentStreak = userData.streak || 0;

  // Calculate simple progress metrics
  const weeklyGoal = 7;
  const weeklyProgress = Math.min(currentStreak, weeklyGoal);
  const weeklyPercentage = (weeklyProgress / weeklyGoal) * 100;

  // Simple achievement system
  const achievements = [
    { 
      id: 'first-session', 
      title: 'Getting Started', 
      description: 'Completed your first session',
      earned: totalSessions >= 1,
      icon: '🌱'
    },
    { 
      id: 'week-streak', 
      title: 'One Week Strong', 
      description: 'Trained for 7 days in a row',
      earned: currentStreak >= 7,
      icon: '🏆'
    },
    { 
      id: 'dedicated', 
      title: 'Dedicated Learner', 
      description: 'Completed 10 training sessions',
      earned: totalSessions >= 10,
      icon: '⭐'
    }
  ];

  const earnedAchievements = achievements.filter(a => a.earned);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="px-3 py-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-3">
              <Brain className="h-10 w-10 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Progress</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="text-xl px-6 py-4"
            >
              <Home className="w-5 h-5 mr-2" />
              Dashboard
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
        </div>
      </header>

      <main className="container mx-auto px-4 pb-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Performance Chart - Now at the top */}
          <PerformanceChart userData={userData} />
          
          {/* Main Progress Stats - Large and Clear */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardHeader className="text-center pb-4">
                <Calendar className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-2xl text-green-800 dark:text-green-200">Current Streak</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-6xl font-bold text-green-600 mb-4">{currentStreak}</div>
                <p className="text-xl text-green-700 dark:text-green-300">
                  {currentStreak === 1 ? 'day' : 'days'} in a row
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                  {currentStreak === 0 ? 'Start today!' : 'Keep it up!'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20">
              <CardHeader className="text-center pb-4">
                <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-2xl text-blue-800 dark:text-blue-200">Total Sessions</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-6xl font-bold text-blue-600 mb-4">{totalSessions}</div>
                <p className="text-xl text-blue-700 dark:text-blue-300">
                  training {totalSessions === 1 ? 'session' : 'sessions'} completed
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                  {totalSessions === 0 ? 'Ready to start?' : 'Great progress!'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Goal Progress */}
          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardHeader className="text-center">
              <Target className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <CardTitle className="text-2xl text-purple-800 dark:text-purple-200">This Week's Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {weeklyProgress} / {weeklyGoal}
                </div>
                <p className="text-xl text-purple-700 dark:text-purple-300">
                  days completed this week
                </p>
              </div>
              
              {/* Simple Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 mb-4">
                <div 
                  className="bg-purple-600 h-6 rounded-full transition-all duration-500 flex items-center justify-center"
                  style={{ width: `${weeklyPercentage}%` }}
                >
                  {weeklyPercentage > 20 && (
                    <span className="text-white font-semibold text-sm">
                      {Math.round(weeklyPercentage)}%
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {weeklyProgress === weeklyGoal 
                    ? "🎉 You've reached your weekly goal!" 
                    : `${weeklyGoal - weeklyProgress} more ${weeklyGoal - weeklyProgress === 1 ? 'day' : 'days'} to reach your goal`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Achievements - Simple and Encouraging */}
          <Card>
            <CardHeader className="text-center">
              <Trophy className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <CardTitle className="text-2xl text-gray-900 dark:text-white">Your Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {earnedAchievements.length > 0 ? (
                <div className="space-y-4">
                  {earnedAchievements.map((achievement) => (
                    <div 
                      key={achievement.id}
                      className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-2 border-yellow-200"
                    >
                      <div className="text-4xl mr-4">{achievement.icon}</div>
                      <div>
                        <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200">
                          {achievement.title}
                        </h3>
                        <p className="text-lg text-yellow-700 dark:text-yellow-300">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🌟</div>
                  <p className="text-xl text-gray-600 dark:text-gray-400">
                    Complete your first session to earn your first achievement!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Encouragement Message */}
          <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-2 border-indigo-200">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <div className="text-4xl mb-4">💪</div>
                <h3 className="text-2xl font-bold text-indigo-800 dark:text-indigo-200 mb-4">
                  {totalSessions === 0 
                    ? "Ready to start your brain fitness journey?" 
                    : currentStreak === 0 
                      ? "Welcome back! Ready for today's session?"
                      : currentStreak < 7 
                        ? "You're building a great habit!" 
                        : "Your dedication is inspiring!"}
                </h3>
                <p className="text-xl text-indigo-700 dark:text-indigo-300">
                  {totalSessions === 0 
                    ? "Every expert was once a beginner. Your first step starts today!" 
                    : currentStreak === 0 
                      ? "Every day is a fresh start. You've got this!"
                      : "Consistency is the key to keeping your mind sharp and healthy."}
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
};

export default Progress;