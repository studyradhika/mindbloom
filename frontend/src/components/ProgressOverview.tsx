import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Target, TrendingUp } from "lucide-react";

interface ProgressOverviewProps {
  userData: any;
}

const ProgressOverview = ({ userData }: ProgressOverviewProps) => {
  const cognitiveAreas = userData.cognitiveAreas || [];
  const streak = userData.streak || 0;
  const totalSessions = userData.totalSessions || 0;

  // Mock progress data - in a real app this would come from user performance
  const getAreaProgress = (area: string) => {
    const baseProgress = Math.min(totalSessions * 5, 100);
    const variation = Math.random() * 20 - 10; // ±10% variation
    return Math.max(0, Math.min(100, baseProgress + variation));
  };

  const achievements = [
    { id: 'first-session', label: 'First Session', earned: totalSessions >= 1 },
    { id: 'week-streak', label: '7-Day Streak', earned: streak >= 7 },
    { id: 'month-streak', label: '30-Day Streak', earned: streak >= 30 },
    { id: 'dedicated', label: 'Dedicated Learner', earned: totalSessions >= 10 },
    { id: 'consistent', label: 'Consistency Champion', earned: streak >= 14 }
  ];

  const earnedAchievements = achievements.filter(a => a.earned);

  return (
    <div className="space-y-6">
      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
            Achievements
          </CardTitle>
          <CardDescription>
            Your cognitive wellness milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          {earnedAchievements.length > 0 ? (
            <div className="space-y-2">
              {earnedAchievements.map((achievement) => (
                <Badge 
                  key={achievement.id}
                  variant="secondary" 
                  className="w-full justify-start py-2 bg-yellow-50 text-yellow-800 border-yellow-200"
                >
                  <Star className="w-4 h-4 mr-2" />
                  {achievement.label}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-4">
              Complete your first session to earn achievements!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Cognitive Areas Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Target className="w-5 h-5 mr-2 text-indigo-600" />
            Focus Areas
          </CardTitle>
          <CardDescription>
            Your progress in selected cognitive skills
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cognitiveAreas.length > 0 ? (
            cognitiveAreas.map((area: string) => {
              const progress = getAreaProgress(area);
              const areaLabels: { [key: string]: string } = {
                attention: 'Attention & Focus',
                memory: 'Memory',
                language: 'Language',
                executive: 'Executive Function',
                processing: 'Processing Speed',
                spatial: 'Spatial Reasoning',
                creativity: 'Creativity'
              };
              
              return (
                <div key={area} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {areaLabels[area] || area}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              );
            })
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-4">
              No focus areas selected
            </p>
          )}
        </CardContent>
      </Card>

      {/* Weekly Goal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            This Week's Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {Math.min(streak, 7)}/7
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Days completed this week
            </p>
            <Progress value={(Math.min(streak, 7) / 7) * 100} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Encouragement */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
              {streak === 0 
                ? "Your journey starts today!" 
                : streak < 7 
                  ? "Building momentum!" 
                  : "You're on fire! 🔥"}
            </h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              {streak === 0 
                ? "Every expert was once a beginner" 
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