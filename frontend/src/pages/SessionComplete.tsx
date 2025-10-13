import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Trophy, Target, Calendar, TrendingUp, ArrowLeft, LogOut, Heart, BookOpen, Clock, CheckCircle } from "lucide-react";
import { showSuccess } from "@/utils/toast";
import ProfileSettingsButton from "@/components/ProfileSettingsButton";
import { SessionCompletionData } from "@/lib/trainingSessionManager";

const SessionComplete = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  
  // Handle both old format and new SessionCompletionData format
  const locationState = location.state || {};
  const completionData: SessionCompletionData | null = locationState.completionData || null;
  const { results, duration, averageScore } = locationState;

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
    // Note: NOT clearing pending areas - they should persist across sign-out/sign-in
    
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

  const getAreaDisplayName = (areaId: string): string => {
    const areaNames: { [key: string]: string } = {
      memory: 'Memory',
      attention: 'Attention',
      language: 'Language',
      executive: 'Executive Function',
      spatial: 'Spatial Reasoning',
      processing: 'Processing Speed',
      creativity: 'Creativity'
    };
    return areaNames[areaId] || areaId;
  };

  const getExerciseDisplayName = (exerciseId: string): string => {
    const exerciseNames: { [key: string]: string } = {
      memory: 'Memory Training',
      attention: 'Attention Training',
      language: 'Word Skills',
      sequencing: 'Task Sequencing',
      'mindful-memory': 'Mindful Memory',
      conversation: 'Social Skills',
      'visual-recall': 'Visual Recall',
      'pattern-recognition': 'Pattern Recognition',
      'rapid-matching': 'Rapid Matching',
      'word-association': 'Word Association',
      'logic-puzzle': 'Logic Puzzle',
      'story-creation': 'Story Creation',
      'spatial-puzzle': 'Spatial Puzzle'
    };
    return exerciseNames[exerciseId] || exerciseId;
  };

  const getExerciseNames = () => {
    if (!results) return [];
    
    return results.map((result: { exerciseId: string }) =>
      getExerciseDisplayName(result.exerciseId)
    );
  };

  const getTodaysProgress = () => {
    const exerciseHistory = userData.exerciseHistory || [];
    const today = new Date().toDateString();
    
    const todaySession = exerciseHistory.find((session: { date: string; exercises?: { skipped?: boolean; score?: number }[] }) => {
      const sessionDate = new Date(session.date).toDateString();
      return sessionDate === today;
    });
    
    if (todaySession && todaySession.exercises) {
      const completedCount = todaySession.exercises.filter((ex) => !ex.skipped && ex.score !== undefined).length;
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
          
          {/* Celebration Title - Dynamic based on completion type */}
          <div className="text-center py-2">
            {completionData ? (
              <div>
                {completionData.type === 'success' && (
                  <>
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle className="w-8 h-8 text-green-500 mr-2" />
                      <h2 className="text-2xl font-bold text-green-700">
                        Perfect! All Areas Completed! 🎉
                      </h2>
                    </div>
                    <p className="text-gray-600">You've successfully practiced all your selected focus areas!</p>
                  </>
                )}
                {completionData.type === 'partial' && (
                  <>
                    <div className="flex items-center justify-center mb-2">
                      <Trophy className="w-8 h-8 text-blue-500 mr-2" />
                      <h2 className="text-2xl font-bold text-blue-700">
                        Great Progress Made! 💪
                      </h2>
                    </div>
                    <p className="text-gray-600">You've made excellent progress today. Come back tomorrow to continue!</p>
                  </>
                )}
                {completionData.type === 'timeout' && (
                  <>
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="w-8 h-8 text-orange-500 mr-2" />
                      <h2 className="text-2xl font-bold text-orange-700">
                        Time Well Spent! ⏰
                      </h2>
                    </div>
                    <p className="text-gray-600">You've put in a solid 10-minute session. Every minute counts!</p>
                  </>
                )}
              </div>
            ) : (
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Great job completing today's session! 🎉
              </h2>
            )}
          </div>

          {/* Stats Overview - Enhanced with completion data */}
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
                      {Math.round(completionData?.averageScore || averageScore || 0)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Average Score</p>
                </div>

                <div className="text-center px-3">
                  <div className="flex items-center justify-center mb-1">
                    <Calendar className="w-5 h-5 text-blue-500 mr-1" />
                    <span className="text-2xl font-bold text-gray-900">
                      {completionData?.results.length || results?.length || 0}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Exercises</p>
                </div>

                <div className="text-center px-3">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="w-5 h-5 text-blue-500 mr-1" />
                    <span className="text-2xl font-bold text-gray-900">
                      {completionData?.duration || duration || 0}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Focus Areas Progress - Show selected and pending areas */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="py-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Focus Areas Progress
                </h3>
                <div className="w-12 h-0.5 bg-indigo-200 rounded-full mx-auto"></div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Focus Areas Selected (Completed) */}
                {completionData && completionData.completedAreas.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg border border-indigo-200">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span className="font-medium text-sm">Focus Areas Completed</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {completionData.completedAreas.map((area) => (
                        <Badge
                          key={area}
                          className="bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200 transition-colors px-3 py-1"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {getAreaDisplayName(area)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg border border-indigo-200">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span className="font-medium text-sm">Focus Areas Completed</span>
                      </div>
                    </div>
                    <div className="text-center text-gray-500">
                      <p className="text-sm">No areas completed in this session</p>
                    </div>
                  </div>
                )}
                
                {/* Focus Areas for Next Time (Pending) */}
                {completionData && completionData.pendingAreas.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-200">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="font-medium text-sm">Focus Areas for Next Time</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {completionData.pendingAreas.map((area) => (
                        <Badge
                          key={area}
                          variant="outline"
                          className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors px-3 py-1"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {getAreaDisplayName(area)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-200">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="font-medium text-sm">Focus Areas for Next Time</span>
                      </div>
                    </div>
                    <div className="text-center text-gray-500">
                      <p className="text-sm">All focus areas completed!</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress visualization */}
              {completionData && completionData.completedAreas.length > 0 && completionData.pendingAreas.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="text-center mb-3">
                    <span className="text-sm font-medium text-gray-600">Session Progress</span>
                  </div>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-indigo-400 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">{completionData.completedAreas.length} completed</span>
                    </div>
                    <div className="flex-1 max-w-32">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-400 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${(completionData.completedAreas.length / (completionData.completedAreas.length + completionData.pendingAreas.length)) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">{completionData.pendingAreas.length} pending</span>
                    </div>
                  </div>
                </div>
              )}
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

          {/* Encouragement Banner - Dynamic based on completion type */}
          <Card className={`text-white shadow-lg ${
            completionData?.type === 'success'
              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
              : completionData?.type === 'timeout'
              ? 'bg-gradient-to-r from-orange-500 to-amber-600'
              : 'bg-gradient-to-r from-purple-500 to-indigo-600'
          }`}>
            <CardContent className="py-4 text-center">
              {completionData?.type === 'success' && (
                <>
                  <h3 className="text-xl font-bold mb-2">Outstanding Achievement! 🌟</h3>
                  <p className="text-sm opacity-90">
                    You completed all your focus areas today. Your dedication is paying off!
                  </p>
                </>
              )}
              {completionData?.type === 'partial' && (
                <>
                  <h3 className="text-xl font-bold mb-2">Excellent Progress! 💪</h3>
                  <p className="text-sm opacity-90">
                    You're building great habits. Tomorrow is another opportunity to grow!
                  </p>
                </>
              )}
              {completionData?.type === 'timeout' && (
                <>
                  <h3 className="text-xl font-bold mb-2">Consistent Effort! ⏰</h3>
                  <p className="text-sm opacity-90">
                    You put in your full 10 minutes today. Consistency is key to progress!
                  </p>
                </>
              )}
              {!completionData && (
                <>
                  <h3 className="text-xl font-bold mb-2">You're doing great! ⭐</h3>
                  <p className="text-sm opacity-90">
                    Every session is a step forward in your cognitive wellness journey.
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Return Button */}
          <div className="text-center pb-4">
            <Button
              onClick={() => navigate('/')}
              size="lg"
              className="text-lg px-8 py-3 bg-indigo-600 hover:bg-indigo-700"
            >
              Return to Homepage
            </Button>
          </div>

          {/* Encouragement Note */}
          <div className="text-center pb-4">
            <p className="text-sm text-gray-500">
              💡 <em>Every session counts! Come back tomorrow to continue your progress.</em>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SessionComplete;