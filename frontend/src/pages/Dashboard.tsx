import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Calendar, Target, TrendingUp, Smile, Meh, Frown, Zap, Coffee } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MoodSelector from "@/components/MoodSelector";
import ProgressOverview from "@/components/ProgressOverview";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [todaysMood, setTodaysMood] = useState<string>('');
  const [showMoodSelector, setShowMoodSelector] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem('mindbloom-user');
    if (storedData) {
      const data = JSON.parse(storedData);
      setUserData(data);
      
      // Check if mood was already set today
      const today = new Date().toDateString();
      const lastMoodDate = localStorage.getItem('mindbloom-last-mood-date');
      const storedMood = localStorage.getItem('mindbloom-today-mood');
      
      if (lastMoodDate === today && storedMood) {
        setTodaysMood(storedMood);
      } else {
        setShowMoodSelector(true);
      }
    } else {
      navigate('/onboarding');
    }
  }, [navigate]);

  const handleMoodSelected = (mood: string) => {
    setTodaysMood(mood);
    setShowMoodSelector(false);
    
    // Store mood for today
    const today = new Date().toDateString();
    localStorage.setItem('mindbloom-today-mood', mood);
    localStorage.setItem('mindbloom-last-mood-date', today);
  };

  const startTraining = () => {
    navigate('/training');
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'motivated': return <Zap className="w-5 h-5 text-green-600" />;
      case 'okay': return <Smile className="w-5 h-5 text-blue-600" />;
      case 'foggy': return <Coffee className="w-5 h-5 text-orange-600" />;
      case 'tired': return <Meh className="w-5 h-5 text-gray-600" />;
      case 'stressed': return <Frown className="w-5 h-5 text-red-600" />;
      default: return <Smile className="w-5 h-5 text-blue-600" />;
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'motivated': return 'bg-green-100 text-green-800 border-green-200';
      case 'okay': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'foggy': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'tired': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'stressed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  if (showMoodSelector) {
    return <MoodSelector onMoodSelected={handleMoodSelected} userName={userData.name} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MindBloom</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowMoodSelector(true)}
            className="text-lg px-4 py-2"
          >
            Change Mood
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {userData.name}!
          </h2>
          <div className="flex items-center space-x-3">
            <span className="text-lg text-gray-600 dark:text-gray-300">Today you're feeling:</span>
            <Badge className={`text-base px-3 py-1 ${getMoodColor(todaysMood)}`}>
              {getMoodIcon(todaysMood)}
              <span className="ml-2 capitalize">{todaysMood}</span>
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Training Card */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Target className="w-6 h-6 mr-2 text-indigo-600" />
                  Today's Brain Training
                </CardTitle>
                <CardDescription className="text-lg">
                  Your personalized 10-minute session is ready based on your {todaysMood} mood
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-600">3</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Exercises</div>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-600">~10</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Minutes</div>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-600">{userData.cognitiveAreas?.length || 3}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Focus Areas</div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={startTraining}
                    size="lg"
                    className="w-full text-xl py-4 bg-indigo-600 hover:bg-indigo-700"
                  >
                    Start Training Session
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Current Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-indigo-600">{userData.streak || 0}</div>
                  <p className="text-gray-600 dark:text-gray-400">consecutive days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Total Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-indigo-600">{userData.totalSessions || 0}</div>
                  <p className="text-gray-600 dark:text-gray-400">completed</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Progress Overview */}
          <div>
            <ProgressOverview userData={userData} />
          </div>
        </div>

        {/* Motivational Message */}
        <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                {userData.streak === 0 
                  ? "Ready to start your journey?" 
                  : userData.streak < 7 
                    ? "You're building a great habit!" 
                    : "Amazing consistency! Keep it up!"}
              </h3>
              <p className="text-green-700 dark:text-green-300">
                {userData.streak === 0 
                  ? "Every expert was once a beginner. Your brain is ready to grow!" 
                  : userData.streak < 7 
                    ? "Each session strengthens your cognitive abilities. You're doing great!" 
                    : "Your dedication to brain health is inspiring. You're making real progress!"}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;