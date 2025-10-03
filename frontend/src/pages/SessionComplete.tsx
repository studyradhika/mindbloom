import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Trophy, Clock, Target, TrendingUp, Share2, Calendar, Lightbulb, ArrowUp, CheckCircle } from "lucide-react";
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

  const shareResults = () => {
    const shareText = `I just completed a brain training session on MindBloom! 🧠\n\nResults:\n• Average Score: ${averageScore}%\n• Duration: ${duration} minutes\n• Streak: ${userData?.streak || 0} days\n\nKeeping my mind sharp! #BrainFitness #MindBloom`;
    
    if (navigator.share) {
      navigator.share({
        title: 'MindBloom Training Results',
        text: shareText,
        url: window.location.origin
      });
    } else {
      navigator.clipboard.writeText(shareText);
      showSuccess('Results copied to clipboard!');
    }
  };

  const getEncouragementMessage = () => {
    if (averageScore >= 90) {
      return {
        title: "Outstanding Performance! 🌟",
        message: "Your cognitive abilities are truly impressive. You're setting a fantastic example of what consistent brain training can achieve!",
        color: "text-yellow-600"
      };
    } else if (averageScore >= 80) {
      return {
        title: "Excellent Work! 🎉",
        message: "You're showing great cognitive strength and focus. Your dedication to brain health is really paying off!",
        color: "text-green-600"
      };
    } else if (averageScore >= 70) {
      return {
        title: "Great Progress! 💪",
        message: "You're building solid cognitive skills. Each session makes your brain stronger and more resilient!",
        color: "text-blue-600"
      };
    } else if (averageScore >= 60) {
      return {
        title: "Good Effort! 👍",
        message: "You're on the right track! Consistency is key in brain training, and you're building a great habit.",
        color: "text-indigo-600"
      };
    } else {
      return {
        title: "Every Step Counts! 🌱",
        message: "Remember, every expert was once a beginner. Your brain is learning and growing with each session!",
        color: "text-purple-600"
      };
    }
  };

  // Convert raw scores to intuitive performance levels
  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200', description: 'Outstanding performance' };
    if (score >= 80) return { level: 'Very Good', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200', description: 'Strong cognitive skills' };
    if (score >= 70) return { level: 'Good', color: 'text-indigo-600', bgColor: 'bg-indigo-50 border-indigo-200', description: 'Solid progress' };
    if (score >= 60) return { level: 'Fair', color: 'text-amber-600', bgColor: 'bg-amber-50 border-amber-200', description: 'Room for improvement' };
    return { level: 'Developing', color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200', description: 'Building foundation' };
  };

  // Generate improvement suggestions based on results
  const getImprovementSuggestions = () => {
    if (!results || results.length === 0) return [];

    const suggestions = [];
    const exerciseNames: { [key: string]: string } = {
      memory: 'Memory Challenge',
      attention: 'Focus Training',
      language: 'Word Skills',
      sequencing: 'Task Sequencing',
      'mindful-memory': 'Mindful Memory',
      conversation: 'Social Skills'
    };

    // Find lowest scoring exercises
    const scoredResults = results.filter((r: any) => !r.skipped && r.score !== undefined);
    const sortedByScore = scoredResults.sort((a: any, b: any) => a.score - b.score);
    
    if (sortedByScore.length > 0) {
      const lowestScore = sortedByScore[0];
      const exerciseName = exerciseNames[lowestScore.exerciseId] || lowestScore.exerciseId;
      
      if (lowestScore.score < 70) {
        suggestions.push({
          icon: ArrowUp,
          title: `Focus on ${exerciseName}`,
          description: `Your ${exerciseName.toLowerCase()} score suggests this area could benefit from extra practice. Consider spending more time on similar exercises.`,
          actionable: true
        });
      }
    }

    // General suggestions based on average score
    if (averageScore < 75) {
      suggestions.push({
        icon: Clock,
        title: 'Practice Consistency',
        description: 'Regular daily practice, even just 10 minutes, can significantly improve your cognitive performance over time.',
        actionable: true
      });
    }

    if (averageScore >= 85) {
      suggestions.push({
        icon: Trophy,
        title: 'Challenge Yourself',
        description: 'Your performance is excellent! Consider exploring more challenging exercises or increasing session frequency.',
        actionable: true
      });
    }

    // Mood-based suggestions
    const mood = localStorage.getItem('mindbloom-today-mood');
    if (mood === 'stressed' || mood === 'tired') {
      suggestions.push({
        icon: Brain,
        title: 'Optimize Training Time',
        description: 'Consider training when you feel most alert and relaxed for better performance. Morning sessions often work well.',
        actionable: false
      });
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  };

  const encouragement = getEncouragementMessage();
  const suggestions = getImprovementSuggestions();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      {/* Header */}
      <header className="container mx-auto px-4 mb-8">
        <div className="flex items-center justify-center space-x-2">
          <Brain className="h-8 w-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Session Complete!</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 max-w-4xl">
        {/* Celebration Card */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200">
          <CardHeader className="text-center">
            <CardTitle className={`text-3xl ${encouragement.color}`}>
              {encouragement.title}
            </CardTitle>
            <CardDescription className="text-lg text-green-700 dark:text-green-300">
              {encouragement.message}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Results Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-center">
                <Target className="w-5 h-5 mr-2 text-indigo-600" />
                Overall Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-indigo-600 mb-2">{averageScore}%</div>
              <Badge 
                variant={averageScore >= 80 ? "default" : averageScore >= 60 ? "secondary" : "outline"}
                className="text-base px-3 py-1"
              >
                {getPerformanceLevel(averageScore).level}
              </Badge>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {getPerformanceLevel(averageScore).description}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Session Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600 mb-2">{duration}</div>
              <p className="text-lg text-blue-700 dark:text-blue-300">minutes</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {duration <= 10 ? 'Quick & efficient!' : duration <= 15 ? 'Perfect timing' : 'Thorough session'}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 mr-2 text-green-600" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600 mb-2">{userData.streak}</div>
              <p className="text-lg text-green-700 dark:text-green-300">consecutive days</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {userData.streak >= 7 ? 'Amazing consistency!' : 'Building momentum'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Exercise Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Exercise Performance Breakdown
            </CardTitle>
            <CardDescription>
              How you performed in each cognitive area today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result: any, index: number) => {
                const exerciseNames: { [key: string]: string } = {
                  memory: 'Memory Challenge',
                  attention: 'Focus Training',
                  language: 'Word Skills',
                  sequencing: 'Task Sequencing',
                  'mindful-memory': 'Mindful Memory',
                  conversation: 'Social Skills'
                };
                
                const exerciseDescriptions: { [key: string]: string } = {
                  memory: 'Working memory and recall abilities',
                  attention: 'Concentration and selective focus',
                  language: 'Verbal reasoning and word skills',
                  sequencing: 'Planning and executive function',
                  'mindful-memory': 'Memory with stress management',
                  conversation: 'Social communication skills'
                };

                const performance = result.skipped ? null : getPerformanceLevel(Math.round(result.score));
                
                return (
                  <div key={index} className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                    result.skipped ? 'bg-gray-50 dark:bg-gray-800 border-gray-200' : performance?.bgColor
                  }`}>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{exerciseNames[result.exerciseId] || result.exerciseId}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {exerciseDescriptions[result.exerciseId] || 'Cognitive training exercise'}
                      </p>
                      {!result.skipped && (
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.round(result.timeSpent / 60)} minutes • {performance?.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {result.skipped ? (
                        <Badge variant="outline">Skipped</Badge>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-2xl font-bold" style={{ color: performance?.color.replace('text-', '') }}>
                            {Math.round(result.score)}%
                          </div>
                          <Badge 
                            variant={result.score >= 80 ? "default" : result.score >= 60 ? "secondary" : "outline"}
                            className={performance?.color}
                          >
                            {performance?.level}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Improvement Suggestions */}
        {suggestions.length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-blue-600" />
                Personalized Suggestions
              </CardTitle>
              <CardDescription>
                Based on today's performance, here's how to keep improving
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => {
                  const IconComponent = suggestion.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                          {suggestion.title}
                        </h3>
                        <p className="text-blue-700 dark:text-blue-300 text-sm">
                          {suggestion.description}
                        </p>
                      </div>
                      {suggestion.actionable && (
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-1" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Achievement Notification */}
        {userData.streak % 7 === 0 && userData.streak > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200">
            <CardContent className="pt-6 pb-6">
              <div className="text-center">
                <Trophy className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                  Achievement Unlocked!
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300">
                  {userData.streak === 7 ? "7-Day Streak Champion!" : 
                   userData.streak === 30 ? "30-Day Consistency Master!" :
                   `${userData.streak}-Day Dedication Award!`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate('/dashboard')}
            size="lg"
            className="text-xl px-8 py-4 bg-indigo-600 hover:bg-indigo-700"
          >
            Return to Dashboard
          </Button>
          
          <Button 
            onClick={shareResults}
            variant="outline"
            size="lg"
            className="text-xl px-8 py-4"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share Results
          </Button>
        </div>

        {/* Next Session Encouragement */}
        <Card className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200">
          <CardContent className="pt-6 pb-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">
                See you tomorrow! 
              </h3>
              <p className="text-purple-700 dark:text-purple-300">
                Your brain grows stronger with each session. Keep up the amazing work!
              </p>
            </div>
          </CardContent>
        </div>
      </main>
    </div>
  );
};

export default SessionComplete;