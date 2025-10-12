import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Home, Calendar, TrendingUp, TrendingDown, Trophy, Target, LogOut, ArrowLeft, BarChart3, AlertTriangle, CheckCircle, Activity, Users, Minus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { theme, getAreaColor, getStatusColor } from "@/lib/theme";
import { getPreviousPage } from "@/lib/navigation";
import ProfileSettingsButton from "@/components/ProfileSettingsButton";
import { progressAPI, userAPI, ProgressSummary, User, FocusAreaAnalytics, handleAuthError } from '@/lib/api';

const Progress = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [progressData, setProgressData] = useState<ProgressSummary | null>(null);
  const [todayData, setTodayData] = useState<{
    hasData: boolean;
    areas?: { [key: string]: { scores: number[]; average: number; count: number } };
    totalExercises?: number;
    completedExercises?: number;
    averageScore?: number;
    duration?: number;
    mood?: string;
    sessionsCount?: number;
    message?: string;
  } | null>(null);
  const [selectedTimeView, setSelectedTimeView] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch user data, progress analytics, and today's performance from backend
        const [userData, progressSummary, todayPerformance] = await Promise.all([
          userAPI.getCurrentUser(),
          progressAPI.getProgressSummary(),
          progressAPI.getTodayPerformance()
        ]);
        
        console.log('📊 Progress: Received user data:', userData);
        console.log('📊 Progress: Received progress summary:', progressSummary);
        console.log('📊 Progress: Received today performance:', todayPerformance);
        
        setUser(userData);
        setProgressData(progressSummary);
        setTodayData(todayPerformance);
      } catch (err) {
        console.error('Error fetching progress data:', err);
        setError('Failed to load progress data');
        handleAuthError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, selectedTimeView]); // Add selectedTimeView dependency to re-render when time view changes

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Brain className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-pulse" />
            <p className="text-xl text-gray-700">Loading your progress...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !user || !progressData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-xl text-gray-700 mb-4">{error || 'Failed to load progress data'}</p>
            <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Focus areas mapping with blue/indigo/teal colors - includes all backend focus areas
  const focusAreas = [
    { id: 'memory', name: 'Memory', color: '#3b82f6', icon: '🧠' },
    { id: 'attention', name: 'Attention', color: '#0891b2', icon: '🎯' },
    { id: 'language', name: 'Language', color: '#1e40af', icon: '💬' },
    { id: 'executive', name: 'Executive Function', color: '#4f46e5', icon: '⚡' },
    { id: 'creativity', name: 'Creativity', color: '#0284c7', icon: '🎨' },
    { id: 'processing', name: 'Processing Speed', color: '#0d9488', icon: '⚡' },
    { id: 'spatial', name: 'Spatial Reasoning', color: '#1d4ed8', icon: '📐' },
    { id: 'general', name: 'General Cognitive', color: '#6366f1', icon: '🧩' },
    { id: 'perception', name: 'Perception', color: '#8b5cf6', icon: '👁️' }
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

  // 1. TODAY'S PERFORMANCE - Use backend today's performance endpoint for actual activities
  const getTodaysPerformance = () => {
    // Check if we have today's data and if it has actual data
    if (!todayData || !todayData.hasData) {
      return { hasData: false };
    }

    // Return the backend data directly since it's already in the correct format
    return {
      hasData: true,
      areas: todayData.areas || {},
      totalExercises: todayData.totalExercises || 0,
      completedExercises: todayData.completedExercises || 0,
      averageScore: todayData.averageScore || 0,
      duration: todayData.duration || 0,
      mood: todayData.mood || 'focused'
    };
  };

  // 2. HISTORICAL PERFORMANCE DATA - Use backend progress trends with proper time view formatting
  const generateHistoricalData = () => {
    if (!progressData || !progressData.recent_performance_trend) {
      return [];
    }

    const dataPoints: Array<{
      date: string;
      period?: string;
      score?: number;
      activities?: number;
    }> = [];

    // Use backend performance trend data with time-view-specific formatting
    progressData.recent_performance_trend.forEach(trend => {
      const trendDate = new Date(trend.date);
      const score = Math.round(trend.score); // Backend already provides percentage
      
      // Format date/period based on selected time view
      let dateLabel = '';
      let periodLabel = '';
      
      switch (selectedTimeView) {
        case 'day':
          // Show hours for daily view
          dateLabel = trendDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });
          periodLabel = dateLabel;
          break;
        case 'week':
          // Show day of week for weekly view
          dateLabel = trendDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          });
          periodLabel = dateLabel;
          break;
        case 'month': {
          // Show week number or date range for monthly view
          const weekOfMonth = Math.ceil(trendDate.getDate() / 7);
          dateLabel = `Week ${weekOfMonth}`;
          periodLabel = dateLabel;
          break;
        }
        case 'year': {
          // Show month name for yearly view
          dateLabel = trendDate.toLocaleDateString('en-US', {
            month: 'short'
          });
          periodLabel = dateLabel;
          break;
        }
        default:
          dateLabel = trendDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          });
          periodLabel = dateLabel;
      }
      
      dataPoints.push({
        date: dateLabel,
        period: periodLabel,
        score,
        activities: trend.activities || 0 // Use actual activity count from backend
      });
    });

    return dataPoints;
  };

  // 3. FOCUS AREA ANALYTICS - Use backend focus area analytics
  const getFocusAreaAnalytics = () => {
    if (!progressData || !progressData.focus_areas_analytics) {
      return [];
    }

    return progressData.focus_areas_analytics.map(area => {
      const currentScore = Math.round(area.current_score);
      const averageScore = Math.round(area.average_score);
      
      // Map backend area names to frontend display
      const areaMapping: { [key: string]: { id: string; name: string; color: string; icon: string } } = {
        'memory': { id: 'memory', name: 'Memory', color: '#3b82f6', icon: '🧠' },
        'attention': { id: 'attention', name: 'Attention', color: '#0891b2', icon: '🎯' },
        'language': { id: 'language', name: 'Language', color: '#1e40af', icon: '💬' },
        'executive': { id: 'executive', name: 'Executive Function', color: '#4f46e5', icon: '⚡' },
        'creativity': { id: 'creativity', name: 'Creativity', color: '#0284c7', icon: '🎨' },
        'processing': { id: 'processing', name: 'Processing Speed', color: '#0d9488', icon: '⚡' },
        'spatial': { id: 'spatial', name: 'Spatial Reasoning', color: '#1d4ed8', icon: '📐' },
        'general': { id: 'general', name: 'General Cognitive', color: '#6366f1', icon: '🧩' },
        'perception': { id: 'perception', name: 'Perception', color: '#8b5cf6', icon: '👁️' }
      };

      const displayArea = areaMapping[area.area_name] || {
        id: area.area_name,
        name: area.area_name,
        color: '#6b7280',
        icon: '🧠'
      };

      return {
        ...displayArea,
        sinceStarted: area.improvement_status === 'improving' ? 'improved' :
                     area.improvement_status === 'declining' ? 'regressed' : 'same',
        sinceLastWeek: area.improvement_status === 'improving' ? 'improved' :
                      area.improvement_status === 'declining' ? 'regressed' : 'same',
        sinceLastMonth: area.improvement_status === 'improving' ? 'improved' :
                       area.improvement_status === 'declining' ? 'regressed' : 'same',
        yearToDate: area.improvement_status === 'improving' ? 'improved' :
                   area.improvement_status === 'declining' ? 'regressed' : 'same',
        currentScore
      };
    });
  };

  // Helper function to get status display properties with blue theme
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'improved':
        return {
          label: 'Improved',
          icon: <TrendingUp className="w-4 h-4" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
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

  // 4. SIMPLIFIED RECOMMENDATIONS - Use backend recommendations
  const getRecommendations = () => {
    if (!progressData) {
      return { performanceAlerts: [], areasOfExcellence: [] };
    }

    const performanceAlerts = [];
    const areasOfExcellence = [];

    // PERFORMANCE ALERTS - Areas needing attention
    if (progressData.improvement_areas && progressData.improvement_areas.length > 0) {
      performanceAlerts.push({
        title: 'Areas Needing Attention',
        description: `Focus on improving: ${progressData.improvement_areas.join(', ')}`,
        action: 'Consider increasing practice frequency in these areas or adjusting exercise difficulty to rebuild confidence'
      });
    }

    // Check consistency issues
    if (progressData.current_streak < 3) {
      performanceAlerts.push({
        title: 'Consistency Gap',
        description: 'Training sessions have been irregular recently',
        action: 'Try to maintain daily sessions, even if shorter - consistency is key to cognitive improvement'
      });
    }

    // Check if overall performance is low
    if (progressData.overall_average_score < 0.6) {
      performanceAlerts.push({
        title: 'Challenge Level May Be Too High',
        description: 'Recent scores suggest exercises may be too difficult',
        action: 'Consider taking breaks between exercises or adjusting difficulty settings for better success rates'
      });
    }

    // AREAS OF EXCELLENCE - Celebrate successes
    if (progressData.strengths && progressData.strengths.length > 0) {
      areasOfExcellence.push({
        title: 'Outstanding Progress!',
        description: `Excellent performance in: ${progressData.strengths.join(', ')}`,
        action: 'Keep up the excellent work in these areas - your dedication is paying off'
      });
    }

    // Consistency achievement
    if (progressData.current_streak >= 7) {
      areasOfExcellence.push({
        title: 'Excellent Training Consistency',
        description: `${progressData.current_streak} day training streak demonstrates strong commitment`,
        action: 'Your consistent practice is the foundation of cognitive improvement - maintain this excellent habit'
      });
    }

    // Overall performance recognition
    if (progressData.overall_average_score >= 0.8) {
      areasOfExcellence.push({
        title: 'Exceptional Performance',
        description: `Outstanding ${Math.round(progressData.overall_average_score)}% average score across all exercises`,
        action: 'Your cognitive training performance is truly impressive - continue with your current routine'
      });
    }

    return { performanceAlerts, areasOfExcellence };
  };

  const todaysPerformance = getTodaysPerformance();
  const historicalData = generateHistoricalData();
  const focusAreaAnalytics = getFocusAreaAnalytics();
  const { performanceAlerts, areasOfExcellence } = getRecommendations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          {/* LEFT: Home Button and Back to Dashboard Button */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="px-3 py-2 text-gray-600 hover:text-gray-800"
            >
              <Home className="w-4 h-4 mr-1" />
              Home
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          
          {/* CENTER: Performance Analytics Branding */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-3">
            <Brain className="h-10 w-10 text-indigo-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent">
              Performance Analytics
            </h1>
          </div>
          
          {/* RIGHT: Settings, Sign Out, and User Greeting */}
          <div className="flex items-center space-x-3">
            <ProfileSettingsButton /> {/* Add the settings button here */}
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="px-3 py-2 text-gray-600 hover:text-gray-800"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Sign Out
            </Button>
            <div className="flex items-center justify-center px-3 py-1 bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-medium rounded-full">
              Hi, {user.name}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* 1. TODAY'S PERFORMANCE */}
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-teal-50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center text-blue-800">
                <Calendar className="w-7 h-7 mr-3" />
                Today's Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaysPerformance.hasData ? (
                <div className="space-y-6">
                  {/* Overall Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-blue-200">
                      <div className="text-3xl font-bold text-blue-600">{todaysPerformance.averageScore}%</div>
                      <div className="text-sm text-blue-700 font-medium">Average Score</div>
                    </div>
                    <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-indigo-200">
                      <div className="text-3xl font-bold text-indigo-600">{todaysPerformance.completedExercises}/{todaysPerformance.totalExercises}</div>
                      <div className="text-sm text-indigo-700 font-medium">Completed</div>
                    </div>
                    <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-teal-200">
                      <div className="text-3xl font-bold text-teal-600">{todaysPerformance.duration}min</div>
                      <div className="text-sm text-teal-700 font-medium">Duration</div>
                    </div>
                  </div>

                  {/* Area Performance */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(todaysPerformance.areas).map(([areaId, data]: [string, { scores: number[]; average: number }]) => {
                      const area = focusAreas.find(a => a.id === areaId) || {
                        id: areaId,
                        name: areaId.charAt(0).toUpperCase() + areaId.slice(1),
                        color: '#6b7280',
                        icon: '🧠'
                      };
                      return (
                        <div key={areaId} className="p-4 bg-white/80 backdrop-blur-sm rounded-lg border-l-4" style={{ borderColor: area.color }}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{area.name}</h3>
                              <p className="text-2xl font-bold" style={{ color: area.color }}>{data.average}%</p>
                            </div>
                            <div className="text-2xl">{area.icon}</div>
                          </div>
                          <p className="text-sm text-gray-600">{data.scores.length} exercise{data.scores.length !== 1 ? 's' : ''}</p>
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
                  {['day', 'week', 'month', 'year'].map((period) => (
                    <Button
                      key={period}
                      variant={selectedTimeView === period ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTimeView(period as 'day' | 'week' | 'month' | 'year')}
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
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#3b82f6' }}
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
                <div className="text-center p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-blue-200">
                  <div className="text-xl font-bold text-blue-600">
                    {Math.max(...historicalData.map(d => d.score))}%
                  </div>
                  <div className="text-sm text-blue-700 font-medium">Best Score</div>
                </div>
                <div className="text-center p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-teal-200">
                  <div className="text-xl font-bold text-teal-600">
                    {historicalData.reduce((sum, d) => sum + d.activities, 0)}
                  </div>
                  <div className="text-sm text-teal-700 font-medium">Total Activities</div>
                </div>
                <div className="text-center p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-cyan-200">
                  <div className="text-xl font-bold text-cyan-600 flex items-center justify-center">
                    {historicalData[historicalData.length - 1]?.score > historicalData[0]?.score ? (
                      <><TrendingUp className="w-4 h-4 mr-1" />Up</>
                    ) : (
                      <><TrendingDown className="w-4 h-4 mr-1" />Down</>
                    )}
                  </div>
                  <div className="text-sm text-cyan-700 font-medium">Trend</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. FOCUS AREA ANALYTICS */}
          <Card className="border-2 border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center text-teal-800">
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
                      <CheckCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                      <p className="text-xl text-gray-700 mb-2">No Performance Concerns</p>
                      <p className="text-gray-600">Your cognitive training is on track!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Areas of Excellence */}
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-teal-50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center text-blue-800">
                  <Trophy className="w-7 h-7 mr-3" />
                  Areas of Excellence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {areasOfExcellence.length > 0 ? areasOfExcellence.map((excellence, index) => (
                    <div key={index} className="p-4 bg-white/80 backdrop-blur-sm rounded-lg border-l-4 border-blue-400 shadow-sm">
                      <h3 className="font-semibold text-blue-900 mb-2">{excellence.title}</h3>
                      <p className="text-blue-700 mb-3">{excellence.description}</p>
                      <div className="bg-blue-50 p-3 rounded text-sm">
                        <strong className="text-blue-800">Keep It Up:</strong>
                        <p className="text-blue-700 mt-1">{excellence.action}</p>
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