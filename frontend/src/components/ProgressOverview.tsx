import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Target, TrendingUp } from "lucide-react";

interface ProgressOverviewProps {
  userData: any;
}

const ProgressOverview = ({ userData }: ProgressOverviewProps) => {
  const streak = userData.streak || 0;
  const totalSessions = userData.totalSessions || 0;

  // Simple achievement system - only show earned achievements
  const achievements = [
    { id: 'first-session', label: 'First Session Complete', earned: totalSessions >= 1, icon: '🌱' },
    { id: 'week-streak', label: '7-Day Streak', earned: streak >= 7, icon: '🏆' },
    { id: 'dedicated', label: '10 Sessions Complete', earned: totalSessions >= 10, icon: '⭐' },
    { id: 'month-streak', label: '30-Day Streak', earned: streak >= 30, icon: '🎯' }
  ];

  const earnedAchievements = achievements.filter(a => a.earned);

  // Weekly goal progress
  const weeklyGoal = 7;
  const weeklyProgress = Math.min(streak, weeklyGoal);

  return (
    <div className="space-y-8">
      
      {/* Current Progress - Large and Clear */}
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center">
            <TrendingUp className="w-8 h-8 mr-3 text-green-600" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6 text-center">
            <div>
              <div className="text-5xl font-bold text-green-600 mb-2">{streak}</div>
              <p className="text-xl text-green-700 dark:text-green-300">
                Day{streak !== 1 ? 's' : ''} in a Row
              </p>
            </div>
            <div>
              <div className="text-5xl font-bold text-blue-600 mb-2">{totalSessions}</div>
              <p className="text-xl text-blue-700 dark:text-blue-300">
                Session{totalSessions !== 1 ? 's' : ''} Complete
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Goal - Simple Progress */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center">
            <Target className="w-8 h-8 mr-3 text-purple-600" />
            This Week's Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {weeklyProgress} / {weeklyGoal}
            </div>
            <p className="text-xl text-purple-700 dark:text-purple-300">
              days completed
            </p>
          </div>
          
          {/* Simple visual progress */}
          <div className="flex justify-center space-x-2 mb-4">
            {Array.from({ length: weeklyGoal }, (_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  i < weeklyProgress ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                {i < weeklyProgress ? '✓' : i + 1}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {weeklyProgress === weeklyGoal 
                ? "🎉 Weekly goal achieved!" 
                : `${weeklyGoal - weeklyProgress} more day${weeklyGoal - weeklyProgress !== 1 ? 's' : ''} to go`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Achievements - Only Show Earned Ones */}
      {earnedAchievements.length > 0 && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center">
              <Trophy className="w-8 h-8 mr-3 text-yellow-600" />
              Your Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {earnedAchievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-2 border-yellow-200"
                >
                  <div className="text-3xl mr-4">{achievement.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200">
                      {achievement.label}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Encouragement */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200">
        <CardContent className="pt-8 pb-8">
          <div className="text-center">
            <div className="text-4xl mb-4">
              {streak === 0 ? '🌟' : streak < 7 ? '💪' : '🔥'}
            </div>
            <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-3">
              {streak === 0 
                ? "Ready to start?" 
                : streak < 7 
                  ? "Building momentum!" 
                  : "You're on fire!"}
            </h3>
            <p className="text-xl text-blue-700 dark:text-blue-300">
              {streak === 0 
                ? "Every journey begins with a single step" 
                : streak < 7 
                  ? "Consistency is the key to success" 
                  : "Your dedication is truly inspiring"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressOverview;