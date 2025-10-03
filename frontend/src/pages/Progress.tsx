import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Home, Calendar, TrendingUp, TrendingDown, Trophy, Target, LogOut, ArrowLeft, BarChart3, AlertCircle, CheckCircle, Activity, Users } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Tooltip, Legend } from "recharts";

const Progress = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [selectedTimeView, setSelectedTimeView] = useState<'day' | 'week' | 'month' | 'year'>('week');

  useEffect(() => {
    const storedData = localStorage.getItem('mindbloom-user');
    if (storedData) {
      setUserData(JSON.parse(storedData));
    } else {
      navigate('/onboarding');
    }
  }, [navigate]);

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

  if (!userData) {
    return <div>Loading...</div>;
  }

  // Focus areas mapping
  const focusAreas = [
    { id: 'memory', name: 'Memory', color: '#10b981', icon: '🧠' },
    { id: 'attention', name: 'Attention', color: '#3b82f6', icon: '🎯' },
    { id: 'language', name: 'Language', color: '#f59e0b', icon: '💬' },
    { id: 'executive', name: 'Executive Function', color: '#8b5cf6', icon: '⚡' },
    { id: 'creativity', name: 'Creativity', color: '#ec4899', icon: '🎨' },
    { id: 'processing', name: 'Processing Speed', color: '#06b6d4', icon: '⚡' },
    { id: 'spatial', name: 'Spatial Reasoning', color: '#84cc16', icon: '📐' }
  ];

  // 1. TODAY'S PERFORMANCE
  const getTodaysPerformance = () => {
    const exerciseHistory = userData.exerciseHistory || [];
    const today = new Date().toDateString();
    
    const todaySession = exerciseHistory.find((session: any) => {
      const sessionDate = new Date(session.date).toDateString();
      return sessionDate === today;
    });

    if (todaySession && todaySession.exercises) {
      const areaPerformance: { [key: string]: { scores: number[], average: number, count: number } } = {};
      
      todaySession.exercises.forEach((exercise: any) => {
        let areaId = 'memory'; // default
        
        switch (exercise.exerciseId) {
          case 'memory':
          case 'mindful-memory':
            areaId = 'memory';
            break;
          case 'attention':
            areaId = 'attention';
            break;
          case 'language':
            areaId = 'language';
            break;
          case 'sequencing':
            areaId = 'executive';
            break;
          case 'conversation':
            areaId = 'language';
            break;
        }

        if (!areaPerformance[areaId]) {
          areaPerformance[areaId] = { scores: [], average: 0, count: 0 };
        }
        
        areaPerformance[areaId].count++;
        if (exercise.score !== undefined && !exercise.skipped) {
          areaPerformance[areaId].scores.push(exercise.score);
        }
      });

      // Calculate averages
      Object.keys(areaPerformance).forEach(areaId => {
        const scores = areaPerformance[areaId].scores;
        if (scores.length > 0) {
          areaPerformance[areaId].average = Math.round(
            scores.reduce((sum, score) => sum + score, 0) / scores.length
          );
        }
      });

      return {
        hasData: true,
        areas: areaPerformance,
        totalExercises: todaySession.exercises.length,
        completedExercises: todaySession.exercises.filter((ex: any) => !ex.skipped).length,
        averageScore: todaySession.averageScore || 0,
        duration: todaySession.duration || 0,
        mood: todaySession.mood || 'okay'
      };
    }

    return { hasData: false };
  };

  // 2. HISTORICAL PERFORMANCE DATA
  const generateHistoricalData = () => {
    const now = new Date();
    let dataPoints: any[] = [];
    let days = 7;
    let interval = 1;
    
    switch (selectedTimeView) {
      case 'day':
        // Show hourly data for today (simulated)
        for (let i = 8; i <= 20; i += 2) {
          dataPoints.push({
            period: `${i}:00`,
            score: Math.round(65 + Math.random() * 25),
            activities: Math.floor(Math.random() * 3)
          });
        }
        break;
      case 'week':
        days = 7;
        interval = 1;
        break;
      case 'month':
        days = 30;
        interval = 2;
        break;
      case 'year':
        days = 365;
        interval = 15;
        break;
    }

    if (selectedTimeView !== 'day') {
      for (let i = days; i >= 0; i -= interval) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        const baseScore = 65 + (days - i) * 0.2; // Gradual improvement
        const variation = (Math.random() - 0.5) * 10;
        const score = Math.max(40, Math.min(95, baseScore + variation));
        
        dataPoints.push({
          period: date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            ...(selectedTimeView === 'year' && { year: '2-digit' })
          }),
          score: Math.round(score),
          activities: Math.floor(Math.random() * 4) + 1
        });
      }
    }

    return dataPoints;
  };

  // 3. FOCUS AREA PERFORMANCE ANALYTICS
  const getFocusAreaAnalytics = () => {
    return focusAreas.map(area => {
      // Simulate historical data for each focus area
      const currentWeekActivities = Math.floor(Math.random() * 8) + 2;
      const lastWeekActivities = Math.floor(Math.random() * 8) + 2;
      const currentMonthActivities = Math.floor(Math.random() * 25) + 10;
      const lastMonthActivities = Math.floor(Math.random() * 25) + 10;
      
      const weekTrend = currentWeekActivities > lastWeekActivities ? 'up' : 'down';
      const monthTrend = currentMonthActivities > lastMonthActivities ? 'up' : 'down';
      
      const avgScore = Math.round(65 + Math.random() * 25);
      const lastAvgScore = Math.round(65 + Math.random() * 25);
      const scoreTrend = avgScore > lastAvgScore ? 'up' : 'down';

      return {
        ...area,
        currentWeekActivities,
        lastWeekActivities,
        currentMonthActivities,
        lastMonthActivities,
        weekTrend,
        monthTrend,
        avgScore,
        lastAvgScore,
        scoreTrend,
        weekChange: currentWeekActivities - lastWeekActivities,
        monthChange: currentMonthActivities - lastMonthActivities,
        scoreChange: avgScore - lastAvgScore
      };
    });
  };

  // 4. IMPROVEMENT RECOMMENDATIONS
  const getImprovementRecommendations = () => {
    const focusAnalytics = getFocusAreaAnalytics();
    const todaysPerf = getTodaysPerformance();
    const recommendations = [];

    // Check for declining areas
    const decliningAreas = focusAnalytics.filter(area => area.weekTrend === 'down');
    if (decliningAreas.length > 0) {
      recommendations.push({
        type: 'concern',
        title: 'Areas Needing Attention',
        description: `${decliningAreas.map(a => a.name).join(', ')} showing decreased activity this week`,
        action: 'Consider focusing more time on these areas in upcoming sessions',
        priority: 'high'
      });
    }

    // Check consistency
    if (userData.streak < 3) {
      recommendations.push({
        type: 'improvement',
        title: 'Build Consistency',
        description: 'Regular practice is key to cognitive improvement',
        action: 'Try to maintain daily sessions, even if shorter',
        priority: 'medium'
      });
    }

    // Check performance scores
    if (todaysPerf.hasData && todaysPerf.averageScore < 60) {
      recommendations.push({
        type: 'support',
        title: 'Performance Support',
        description: 'Recent scores suggest exercises may be challenging',
        action: 'Consider adjusting difficulty or taking breaks between exercises',
        priority: 'medium'
      });
    }

    // Positive reinforcement
    const improvingAreas = focusAnalytics.filter(area => area.weekTrend === 'up');
    if (improvingAreas.length > 0) {
      recommendations.push({
        type: 'success',
        title: 'Great Progress!',
        description: `Excellent improvement in ${improvingAreas.map(a => a.name).join(', ')}`,
        action: 'Keep up the great work in these areas',
        priority: 'positive'
      });
    }

    return recommendations;
  };

  const todaysPerformance = getTodaysPerformance();
  const historicalData = generateHistoricalData();
  const focusAreaAnalytics = getFocusAreaAnalytics();
  const recommendations = getImprovementRecommendations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
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
              <Brain className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Analytics</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="px-3 py-2 text-gray-600 dark:text-gray-400"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* 1. TODAY'S PERFORMANCE */}
          <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-green-600" />
                Today's Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaysPerformance.hasData ? (
                <div className="space-y-6">
                  {/* Overall Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{todaysPerformance.averageScore}%</div>
                      <div className="text-sm text-gray-600">Average Score</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{todaysPerformance.completedExercises}/{todaysPerformance.totalExercises}</div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{todaysPerformance.duration}min</div>
                      <div className="text-sm text-gray-600">Duration</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 capitalize">{todaysPerformance.mood}</div>
                      <div className="text-sm text-gray-600">Mood</div>
                    </div>
                  </div>

                  {/* Area Performance */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(todaysPerformance.areas).map(([areaId, data]: [string, any]) => {
                      const area = focusAreas.find(a => a.id === areaId);
                      return (
                        <div key={areaId} className="p-4 bg-white rounded-lg border-l-4" style={{ borderColor: area?.color }}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{area?.name}</h3>
                              <p className="text-2xl font-bold" style={{ color: area?.color }}>{data.average}%</p>
                            </div>
                            <div className="text-2xl">{area?.icon}</div>
                          </div>
                          <p className="text-sm text-gray-600">{data.count} exercise{data.count !== 1 ? 's' : ''}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-600">No training session completed today</p>
                  <p className="text-gray-500">Start your daily exercises to see performance data</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. HISTORICAL PERFORMANCE */}
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
                  Performance Trends
                </CardTitle>
                <div className="flex space-x-2">
                  {['day', 'week', 'month', 'year'].map((period) => (
                    <Button
                      key={period}
                      variant={selectedTimeView === period ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTimeView(period as any)}
                      className="capitalize"
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Performance Score (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Trend Summary */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {Math.round(historicalData.reduce((sum, d) => sum + d.score, 0) / historicalData.length)}%
                  </div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {Math.max(...historicalData.map(d => d.score))}%
                  </div>
                  <div className="text-sm text-gray-600">Best Score</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-lg font-bold text-purple-600">
                    {historicalData.reduce((sum, d) => sum + d.activities, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Activities</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-lg font-bold text-orange-600 flex items-center justify-center">
                    {historicalData[historicalData.length - 1]?.score > historicalData[0]?.score ? (
                      <><TrendingUp className="w-4 h-4 mr-1" />Up</>
                    ) : (
                      <><TrendingDown className="w-4 h-4 mr-1" />Down</>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Trend</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. FOCUS AREA ANALYTICS */}
          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Target className="w-6 h-6 mr-2 text-purple-600" />
                Focus Area Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {focusAreaAnalytics.map((area) => (
                  <div key={area.id} className="p-4 bg-white rounded-lg border-l-4" style={{ borderColor: area.color }}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{area.name}</h3>
                      <div className="text-2xl">{area.icon}</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">This Week:</span>
                        <div className="flex items-center">
                          <span className="font-semibold">{area.currentWeekActivities} activities</span>
                          {area.weekTrend === 'up' ? (
                            <TrendingUp className="w-4 h-4 ml-1 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 ml-1 text-red-500" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Avg Score:</span>
                        <div className="flex items-center">
                          <span className="font-semibold" style={{ color: area.color }}>{area.avgScore}%</span>
                          {area.scoreTrend === 'up' ? (
                            <TrendingUp className="w-4 h-4 ml-1 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 ml-1 text-red-500" />
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        {area.weekChange > 0 ? '+' : ''}{area.weekChange} activities vs last week
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 4. IMPROVEMENT RECOMMENDATIONS */}
          <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Users className="w-6 h-6 mr-2 text-orange-600" />
                Recommendations for You & Your Caregiver
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border-l-4 ${
                      rec.priority === 'high' ? 'bg-red-50 border-red-400' :
                      rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                      rec.priority === 'positive' ? 'bg-green-50 border-green-400' :
                      'bg-blue-50 border-blue-400'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        {rec.type === 'concern' && <AlertCircle className="w-5 h-5 text-red-500" />}
                        {rec.type === 'improvement' && <TrendingUp className="w-5 h-5 text-yellow-500" />}
                        {rec.type === 'support' && <Users className="w-5 h-5 text-blue-500" />}
                        {rec.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                        <p className="text-gray-700 mt-1">{rec.description}</p>
                        <div className="mt-2 p-2 bg-white/50 rounded text-sm">
                          <strong>Action:</strong> {rec.action}
                        </div>
                      </div>
                      <Badge 
                        variant={rec.priority === 'high' ? 'destructive' : 
                                rec.priority === 'positive' ? 'default' : 'secondary'}
                      >
                        {rec.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
};

export default Progress;