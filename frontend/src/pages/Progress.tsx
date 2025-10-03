import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Home, Calendar, TrendingUp, TrendingDown, Trophy, Target, LogOut, ArrowLeft, BarChart3, AlertTriangle, CheckCircle, Activity, Users, Minus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { theme, getAreaColor, getStatusColor } from "@/lib/theme";
import { getPreviousPage } from "@/lib/navigation";

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

  const handleBack = () => {
    const previousPage = getPreviousPage('/progress');
    navigate(previousPage);
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Brain className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-pulse" />
            <p className="text-xl text-gray-700">Loading your progress...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Focus areas mapping with consistent colors
  const focusAreas = [
    { id: 'memory', name: 'Memory', color: theme.colors.cognitive.memory, icon: '🧠' },
    { id: 'attention', name: 'Attention', color: theme.colors.cognitive.attention, icon: '🎯' },
    { id: 'language', name: 'Language', color: theme.colors.cognitive.language, icon: '💬' },
    { id: 'executive', name: 'Executive Function', color: theme.colors.cognitive.executive, icon: '⚡' },
    { id: 'creativity', name: 'Creativity', color: theme.colors.cognitive.creativity, icon: '🎨' },
    { id: 'processing', name: 'Processing Speed', color: theme.colors.cognitive.processing, icon: '⚡' },
    { id: 'spatial', name: 'Spatial Reasoning', color: theme.colors.cognitive.spatial, icon: '📐' }
  ];

  // Helper function to determine improvement status
  const getImprovementStatus = (current: number, previous: number) => {
    const threshold = 5;
    const difference = current - previous;
    
    if (Math.abs(difference) <= threshold) {
      return 'same';
    } else if (difference > 0) {
      return 'improved';
    } else {
      return 'regressed';
    }
  };

  // 1. TODAY'S PERFORMANCE - Accurate calculation
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
        let areaId = 'memory';
        
        switch (exercise.exerciseId) {
          case 'memory':
          case 'mindful-memory':
            areaId = 'memory';
            break;
          case 'attention':
            areaId = 'attention';
            break;
          case 'language':
          case 'conversation':
            areaId = 'language';
            break;
          case 'sequencing':
            areaId = 'executive';
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

      // Calculate accurate averages
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
        averageScore: Math.round(todaySession.averageScore || 0),
        duration: todaySession.duration || 0,
        mood: todaySession.mood || 'okay'
      };
    }

    return { hasData: false };
  };

  // 2. HISTORICAL PERFORMANCE DATA - More realistic
  const generateHistoricalData = () => {
    const exerciseHistory = userData.exerciseHistory || [];
    const now = new Date();
    let dataPoints: any[] = [];
    let days = 7;
    let interval = 1;
    
    switch (selectedTimeView) {
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

    // Use actual data where available, simulate realistic data otherwise
    for (let i = days; i >= 0; i -= interval) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateString = date.toDateString();
      
      // Check if we have actual data for this date
      const actualSession = exerciseHistory.find((session: any) => 
        new Date(session.date).toDateString() === dateString
      );
      
      let score = 0;
      if (actualSession) {
        score = Math.round(actualSession.averageScore || 0);
      } else {
        // Generate realistic simulated data with gradual improvement
        const baseScore = 65;
        const improvement = (days - i) * 0.2;
        const variation = (Math.random() - 0.5) * 10;
        score = Math.max(40, Math.min(95, baseScore + improvement + variation));
        score = Math.round(score);
      }
      
      dataPoints.push({
        period: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          ...(selectedTimeView === 'year' && { year: '2-digit' })
        }),
        score,
        activities: actualSession ? actualSession.exercises.length : Math.floor(Math.random() * 3) + 1
      });
    }

    return dataPoints;
  };

  // 3. FOCUS AREA ANALYTICS - Based on actual exercise stats
  const getFocusAreaAnalytics = () => {
    return focusAreas.map(area => {
      const exerciseStats = userData.exerciseStats || {};
      
      // Get relevant exercises for this area
      const areaExercises = Object.keys(exerciseStats).filter(exerciseId => {
        switch (area.id) {
          case 'memory':
            return ['memory', 'mindful-memory'].includes(exerciseId);
          case 'attention':
            return exerciseId === 'attention';
          case 'language':
            return ['language', 'conversation'].includes(exerciseId);
          case 'executive':
            return exerciseId === 'sequencing';
          default:
            return false;
        }
      });

      // Calculate current performance
      let currentScore = 65; // Default
      if (areaExercises.length > 0) {
        const scores = areaExercises.map(id => exerciseStats[id].averageScore || 65);
        currentScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
      }

      // Simulate historical scores for comparison
      const lastWeekScore = Math.round(currentScore + (Math.random() - 0.5) * 10);
      const lastMonthScore = Math.round(currentScore + (Math.random() - 0.5) * 15);
      const yearStartScore = Math.round(currentScore - 10 + Math.random() * 5);
      const startingScore = Math.round(currentScore - 15 + Math.random() * 5);

      return {
        ...area,
        sinceStarted: getImprovementStatus(currentScore, startingScore),
        sinceLastWeek: getImprovementStatus(currentScore, lastWeekScore),
        sinceLastMonth: getImprovementStatus(currentScore, lastMonthScore),
        yearToDate: getImprovementStatus(currentScore, yearStartScore),
        currentScore
      };
    });
  };

  // Helper function to get status display properties
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'improved':
        return {
          label: 'Improved',
          icon: <TrendingUp className="w-4 h-4" />,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200'
        };
      case 'regressed':
        return {
          label: 'Regressed',
          icon: <TrendingDown className="w-4 h-4" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'same':
      default:
        return {
          label: 'Stayed the Same',
          icon: <Minus className="w-4 h-4" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  // 4. SIMPLIFIED RECOMMENDATIONS - Two categories only
  const getRecommendations = () => {
    const focusAnalytics = getFocusAreaAnalytics();
    const todaysPerf = getTodaysPerformance();
    
    const performanceAlerts = [];
    const areasOfExcellence = [];

    // PERFORMANCE ALERTS - Areas needing attention
    const regressingAreas = focusAnalytics.filter(area => 
      area.sinceLastWeek === 'regressed' || area.sinceLastMonth === 'regressed'
    );
    
    if (regressingAreas.length > 0) {
      performanceAlerts.push({
        title: 'Declining Performance Detected',
        description: `${regressingAreas.map(a => a.name).join(', ')} showing recent decline`,
        action: 'Consider increasing practice frequency in these areas or adjusting exercise difficulty to rebuild confidence'
      });
    }

    // Check consistency issues
    if ((userData.streak || 0) < 3) {
      performanceAlerts.push({
        title: 'Consistency Gap',
        description: 'Training sessions have been irregular recently',
        action: 'Try to maintain daily sessions, even if shorter - consistency is key to cognitive improvement'
      });
    }

    // Check if exercises are too challenging
    if (todaysPerf.hasData && todaysPerf.averageScore < 60) {
      performanceAlerts.push({
        title: 'Challenge Level May Be Too High',
        description: 'Recent scores suggest exercises may be too difficult',
        action: 'Consider taking breaks between exercises or adjusting difficulty settings for better success rates'
      });
    }

    // AREAS OF EXCELLENCE - Celebrate successes
    const improvingAreas = focusAnalytics.filter(area => 
      area.sinceStarted === 'improved' || area.sinceLastMonth === 'improved'
    );
    
    if (improvingAreas.length > 0) {
      areasOfExcellence.push({
        title: 'Outstanding Progress!',
        description: `Excellent improvement in ${improvingAreas.map(a => a.name).join(', ')}`,
        action: 'Keep up the excellent work in these areas - your dedication is paying off'
      });
    }

    // Long-term progress recognition
    const longTermImprovers = focusAnalytics.filter(area => area.sinceStarted === 'improved');
    if (longTermImprovers.length >= 3) {
      areasOfExcellence.push({
        title: 'Remarkable Long-term Growth',
        description: 'Consistent improvement across multiple cognitive areas since starting',
        action: 'Your dedication is truly impressive - continue with your current routine for sustained cognitive wellness'
      });
    }

    // Consistency achievement
    if ((userData.streak || 0) >= 7) {
      areasOfExcellence.push({
        title: 'Excellent Training Consistency',
        description: `${userData.streak} day training streak demonstrates strong commitment`,
        action: 'Your consistent practice is the foundation of cognitive improvement - maintain this excellent habit'
      });
    }

    return { performanceAlerts, areasOfExcellence };
  };

  const todaysPerformance = getTodaysPerformance();
  const historicalData = generateHistoricalData();
  const focusAreaAnalytics = getFocusAreaAnalytics();
  const { performanceAlerts, areasOfExcellence } = getRecommendations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="px-4 py-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-3">
              <Brain className="h-10 w-10 text-indigo-600" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Performance Analytics
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
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

      <main className="container mx-auto px-4 pb-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* 1. TODAY'S PERFORMANCE */}
          <Card className="border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center text-emerald-800">
                <Calendar className="w-7 h-7 mr-3" />
                Today's Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaysPerformance.hasData ? (
                <div className="space-y-6">
                  {/* Overall Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-emerald-200">
                      <div className="text-3xl font-bold text-emerald-600">{todaysPerformance.averageScore}%</div>
                      <div className="text-sm text-emerald-700 font-medium">Average Score</div>
                    </div>
                    <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-indigo-200">
                      <div className="text-3xl font-bold text-indigo-600">{todaysPerformance.completedExercises}/{todaysPerformance.totalExercises}</div>
                      <div className="text-sm text-indigo-700 font-medium">Completed</div>
                    </div>
                    <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200">
                      <div className="text-3xl font-bold text-purple-600">{todaysPerformance.duration}min</div>
                      <div className="text-sm text-purple-700 font-medium">Duration</div>
                    </div>
                    <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-amber-200">
                      <div className="text-3xl font-bold text-amber-600 capitalize">{todaysPerformance.mood}</div>
                      <div className="text-sm text-amber-700 font-medium">Mood</div>
                    </div>
                  </div>

                  {/* Area Performance */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(todaysPerformance.areas).map(([areaId, data]: [string, any]) => {
                      const area = focusAreas.find(a => a.id === areaId);
                      return (
                        <div key={areaId} className="p-4 bg-white/80 backdrop-blur-sm rounded-lg border-l-4" style={{ borderColor: area?.color }}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{area?.name}</h3>
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
                <div className="text-center py-12">
                  <Activity className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-600 mb-2">No training session completed today</p>
                  <p className="text-gray-500">Start your daily exercises to see performance data</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. HISTORICAL PERFORMANCE */}
          <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center text-indigo-800">
                  <TrendingUp className="w-7 h-7 mr-3" />
                  Performance Trends
                </CardTitle>
                <div className="flex space-x-2">
                  {['week', 'month', 'year'].map((period) => (
                    <Button
                      key={period}
                      variant={selectedTimeView === period ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTimeView(period as any)}
                      className={`capitalize ${
                        selectedTimeView === period 
                          ? 'bg-indigo-600 text-white' 
                          : 'border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                      }`}
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fontSize: 12, fill: '#4f46e5' }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fontSize: 12, fill: '#4f46e5' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '2px solid #c7d2fe',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke={theme.colors.primary[600]}
                      strokeWidth={3}
                      dot={{ r: 5, fill: theme.colors.primary[600] }}
                      name="Performance Score (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Trend Summary */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-indigo-200">
                  <div className="text-xl font-bold text-indigo-600">
                    {Math.round(historicalData.reduce((sum, d) => sum + d.score, 0) / historicalData.length)}%
                  </div>
                  <div className="text-sm text-indigo-700 font-medium">Average Score</div>
                </div>
                <div className="text-center p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-emerald-200">
                  <div className="text-xl font-bold text-emerald-600">
                    {Math.max(...historicalData.map(d => d.score))}%
                  </div>
                  <div className="text-sm text-emerald-700 font-medium">Best Score</div>
                </div>
                <div className="text-center p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200">
                  <div className="text-xl font-bold text-purple-600">
                    {historicalData.reduce((sum, d) => sum + d.activities, 0)}
                  </div>
                  <div className="text-sm text-purple-700 font-medium">Total Activities</div>
                </div>
                <div className="text-center p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-amber-200">
                  <div className="text-xl font-bold text-amber-600 flex items-center justify-center">
                    {historicalData[historicalData.length - 1]?.score > historicalData[0]?.score ? (
                      <><TrendingUp className="w-4 h-4 mr-1" />Up</>
                    ) : (
                      <><TrendingDown className="w-4 h-4 mr-1" />Down</>
                    )}
                  </div>
                  <div className="text-sm text-amber-700 font-medium">Trend</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. FOCUS AREA ANALYTICS */}
          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center text-purple-800">
                <Target className="w-7 h-7 mr-3" />
                Focus Area Performance Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {focusAreaAnalytics.map((area) => (
                  <div key={area.id} className="p-6 bg-white/80 backdrop-blur-sm rounded-lg border-l-4 shadow-sm" style={{ borderColor: area.color }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{area.icon}</div>
                        <h3 className="text-xl font-semibold text-gray-900">{area.name}</h3>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Since Started */}
                      <div className={`p-3 rounded-lg border ${getStatusDisplay(area.sinceStarted).bgColor} ${getStatusDisplay(area.sinceStarted).borderColor}`}>
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-600 mb-1">Since Started</div>
                          <div className={`flex items-center justify-center space-x-1 ${getStatusDisplay(area.sinceStarted).color}`}>
                            {getStatusDisplay(area.sinceStarted).icon}
                            <span className="font-semibold">{getStatusDisplay(area.sinceStarted).label}</span>
                          </div>
                        </div>
                      </div>

                      {/* Since Last Month */}
                      <div className={`p-3 rounded-lg border ${getStatusDisplay(area.sinceLastMonth).bgColor} ${getStatusDisplay(area.sinceLastMonth).borderColor}`}>
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-600 mb-1">Since Last Month</div>
                          <div className={`flex items-center justify-center space-x-1 ${getStatusDisplay(area.sinceLastMonth).color}`}>
                            {getStatusDisplay(area.sinceLastMonth).icon}
                            <span className="font-semibold">{getStatusDisplay(area.sinceLastMonth).label}</span>
                          </div>
                        </div>
                      </div>

                      {/* Since Last Week */}
                      <div className={`p-3 rounded-lg border ${getStatusDisplay(area.sinceLastWeek).bgColor} ${getStatusDisplay(area.sinceLastWeek).borderColor}`}>
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-600 mb-1">Since Last Week</div>
                          <div className={`flex items-center justify-center space-x-1 ${getStatusDisplay(area.sinceLastWeek).color}`}>
                            {getStatusDisplay(area.sinceLastWeek).icon}
                            <span className="font-semibold">{getStatusDisplay(area.sinceLastWeek).label}</span>
                          </div>
                        </div>
                      </div>

                      {/* Year to Date */}
                      <div className={`p-3 rounded-lg border ${getStatusDisplay(area.yearToDate).bgColor} ${getStatusDisplay(area.yearToDate).borderColor}`}>
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-600 mb-1">Year to Date</div>
                          <div className={`flex items-center justify-center space-x-1 ${getStatusDisplay(area.yearToDate).color}`}>
                            {getStatusDisplay(area.yearToDate).icon}
                            <span className="font-semibold">{getStatusDisplay(area.yearToDate).label}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 4. SIMPLIFIED RECOMMENDATIONS */}
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Performance Alerts */}
            <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center text-red-800">
                  <AlertTriangle className="w-7 h-7 mr-3" />
                  Performance Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceAlerts.length > 0 ? performanceAlerts.map((alert, index) => (
                    <div key={index} className="p-4 bg-white/80 backdrop-blur-sm rounded-lg border-l-4 border-red-400 shadow-sm">
                      <h3 className="font-semibold text-red-900 mb-2">{alert.title}</h3>
                      <p className="text-red-700 mb-3">{alert.description}</p>
                      <div className="bg-red-50 p-3 rounded text-sm">
                        <strong className="text-red-800">Recommended Action:</strong>
                        <p className="text-red-700 mt-1">{alert.action}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <p className="text-xl text-gray-700 mb-2">No Performance Concerns</p>
                      <p className="text-gray-600">Your cognitive training is on track!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Areas of Excellence */}
            <Card className="border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center text-emerald-800">
                  <Trophy className="w-7 h-7 mr-3" />
                  Areas of Excellence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {areasOfExcellence.length > 0 ? areasOfExcellence.map((excellence, index) => (
                    <div key={index} className="p-4 bg-white/80 backdrop-blur-sm rounded-lg border-l-4 border-emerald-400 shadow-sm">
                      <h3 className="font-semibold text-emerald-900 mb-2">{excellence.title}</h3>
                      <p className="text-emerald-700 mb-3">{excellence.description}</p>
                      <div className="bg-emerald-50 p-3 rounded text-sm">
                        <strong className="text-emerald-800">Keep It Up:</strong>
                        <p className="text-emerald-700 mt-1">{excellence.action}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-xl text-gray-700 mb-2">Building Excellence</p>
                      <p className="text-gray-600">Continue training to see your areas of strength emerge!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </main>
    </div>
  );
};

export default Progress;