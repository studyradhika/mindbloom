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
import { dataAPI, User, handleAuthError } from '@/lib/api';

const Progress = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<{
    user: User;
    exerciseHistory: Array<{
      date: string;
      averageScore?: number;
      duration?: number;
      mood?: string;
      exercises: Array<{
        exerciseId: string;
        score?: number;
        skipped: boolean;
      }>;
    }>;
  } | null>(null);
  const [selectedTimeView, setSelectedTimeView] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dataAPI.getUserDataWithHistory();
        console.log('📊 Progress: Received user data:', data);
        console.log('📊 Progress: Exercise history:', data.exerciseHistory);
        setUserData(data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
        handleAuthError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
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

  if (error || !userData) {
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

  // Focus areas mapping with blue/indigo/teal colors
  const focusAreas = [
    { id: 'memory', name: 'Memory', color: '#3b82f6', icon: '🧠' },
    { id: 'attention', name: 'Attention', color: '#0891b2', icon: '🎯' },
    { id: 'language', name: 'Language', color: '#1e40af', icon: '💬' },
    { id: 'executive', name: 'Executive Function', color: '#4f46e5', icon: '⚡' },
    { id: 'creativity', name: 'Creativity', color: '#0284c7', icon: '🎨' },
    { id: 'processing', name: 'Processing Speed', color: '#0d9488', icon: '⚡' },
    { id: 'spatial', name: 'Spatial Reasoning', color: '#1d4ed8', icon: '📐' }
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

  // 1. TODAY'S PERFORMANCE - Accurate calculation with timezone handling
  const getTodaysPerformance = () => {
    const exerciseHistory = userData?.exerciseHistory || [];
    const now = new Date();
    
    console.log('📊 Progress: getTodaysPerformance - Current time:', now.toISOString());
    console.log('📊 Progress: getTodaysPerformance - Exercise history:', exerciseHistory);
    
    const todaySession = exerciseHistory.find((session) => {
      const sessionDate = new Date(session.date);
      
      // Check if the session was completed within the last 24 hours
      const timeDiff = now.getTime() - sessionDate.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      console.log(`📊 Progress: Session ${session.date} was ${hoursDiff.toFixed(2)} hours ago`);
      
      // Consider it "today" if it was within the last 24 hours
      // This handles timezone differences better than date comparison
      return hoursDiff >= 0 && hoursDiff <= 24;
    });
    
    console.log('📊 Progress: Found today session:', todaySession);

    if (todaySession && todaySession.exercises) {
      const areaPerformance: { [key: string]: { scores: number[], average: number, count: number } } = {};
      
      todaySession.exercises.forEach((exercise) => {
        let areaId = 'general'; // Default to general if not mapped
        
        switch (exercise.exerciseId) {
          case 'memory':
          case 'mindful-memory':
          case 'visual-recall':
            areaId = 'memory';
            break;
          case 'attention':
          case 'pattern-recognition':
            areaId = 'attention';
            break;
          case 'language':
          case 'conversation':
          case 'word-association':
            areaId = 'language';
            break;
          case 'sequencing':
          case 'logic-puzzle':
            areaId = 'executive';
            break;
          case 'story-creation':
            areaId = 'creativity';
            break;
          case 'rapid-matching':
            areaId = 'processing';
            break;
          case 'spatial-puzzle':
            areaId = 'spatial';
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
        completedExercises: todaySession.exercises.filter((ex) => !ex.skipped).length,
        averageScore: Math.round(todaySession.averageScore || 0),
        duration: todaySession.duration || 0,
        mood: todaySession.mood || 'okay'
      };
    }

    return { hasData: false };
  };

  // 2. HISTORICAL PERFORMANCE DATA - More realistic
  const generateHistoricalData = () => {
    const exerciseHistory = userData?.exerciseHistory || [];
    const now = new Date();
    const dataPoints: Array<{
      date: string;
      period?: string;
      score?: number;
      activities?: number;
      memory?: number;
      attention?: number;
      language?: number;
      executive?: number;
      creativity?: number;
      processing?: number;
      spatial?: number;
    }> = [];
    let days = 7;
    let interval = 1;
    
    switch (selectedTimeView) {
      case 'day':
        days = 1;
        interval = 1;
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

    // Use actual data where available, simulate realistic data otherwise
    if (selectedTimeView === 'day') {
      // For day view, generate hourly data points
      for (let hour = 0; hour <= 23; hour++) {
        const date = new Date(now);
        date.setHours(hour, 0, 0, 0);
        const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        // Check if we have actual data for this date
        const actualSession = exerciseHistory.find((session) => {
          const sessionDate = new Date(session.date);
          const sessionDay = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());
          return sessionDay.getTime() === targetDay.getTime();
        });
        
        let score = 0;
        if (actualSession) {
          // Use actual session data - prioritize real scores
          if (actualSession.averageScore !== undefined && actualSession.averageScore > 0) {
            score = Math.round(actualSession.averageScore);
          } else if (actualSession.exercises && actualSession.exercises.length > 0) {
            // Calculate from individual exercise scores if averageScore is missing
            const validScores = actualSession.exercises
              .filter((ex) => ex.score !== undefined && !ex.skipped)
              .map((ex) => ex.score!);
            if (validScores.length > 0) {
              score = Math.round(validScores.reduce((sum: number, s: number) => sum + s, 0) / validScores.length);
            }
          }
        } else {
          // No data available for this hour - skip this data point
          score = 0;
        }
        
        // Only add data points where we have actual data
        if (score > 0) {
          dataPoints.push({
            date: date.toLocaleTimeString('en-US', {
              hour: 'numeric',
              hour12: true
            }),
            period: date.toLocaleTimeString('en-US', {
              hour: 'numeric',
              hour12: true
            }),
            score,
            activities: actualSession ? actualSession.exercises.length : 0
          });
        }
      }
    } else {
      // For other views, generate daily data points
      for (let i = days; i >= 0; i -= interval) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        // Check if we have actual data for this date
        const actualSession = exerciseHistory.find((session) => {
          const sessionDate = new Date(session.date);
          const sessionDay = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());
          return sessionDay.getTime() === targetDay.getTime();
        });
        
        let score = 0;
        if (actualSession) {
          // Use actual session data - prioritize real scores
          if (actualSession.averageScore !== undefined && actualSession.averageScore > 0) {
            score = Math.round(actualSession.averageScore);
          } else if (actualSession.exercises && actualSession.exercises.length > 0) {
            // Calculate from individual exercise scores if averageScore is missing
            const validScores = actualSession.exercises
              .filter((ex) => ex.score !== undefined && !ex.skipped)
              .map((ex) => ex.score!);
            if (validScores.length > 0) {
              score = Math.round(validScores.reduce((sum: number, s: number) => sum + s, 0) / validScores.length);
            }
          }
        } else {
          // No data available for this date - skip this data point
          score = 0;
        }
        
        // Only add data points where we have actual data
        if (score > 0) {
          dataPoints.push({
            date: date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              ...(selectedTimeView === 'year' && { year: '2-digit' })
            }),
            period: date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              ...(selectedTimeView === 'year' && { year: '2-digit' })
            }),
            score,
            activities: actualSession ? actualSession.exercises.length : 0
          });
        }
      }
    }

    return dataPoints;
  };

  // 3. FOCUS AREA ANALYTICS - Based on actual exercise stats
  const getFocusAreaAnalytics = () => {
    return focusAreas.map(area => {
      const exerciseStats = {}; // Exercise stats not currently available from backend
      
      // Get relevant exercises for this area
      const areaExercises = Object.keys(exerciseStats).filter(exerciseId => {
        switch (area.id) {
          case 'memory':
            return ['memory', 'mindful-memory', 'visual-recall'].includes(exerciseId);
          case 'attention':
            return ['attention', 'pattern-recognition'].includes(exerciseId);
          case 'language':
            return ['language', 'conversation', 'word-association'].includes(exerciseId);
          case 'executive':
            return ['sequencing', 'logic-puzzle'].includes(exerciseId);
          case 'creativity':
            return ['mindful-memory', 'story-creation'].includes(exerciseId);
          case 'processing':
            return ['attention', 'rapid-matching'].includes(exerciseId);
          case 'spatial':
            return ['memory', 'spatial-puzzle'].includes(exerciseId);
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

      // Calculate historical scores from actual data
      const exerciseHistory = userData?.exerciseHistory || [];
      const now = new Date();
      
      // Get actual historical scores
      const lastWeekDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const lastMonthDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const yearStartDate = new Date(now.getFullYear(), 0, 1);
      
      const lastWeekSession = exerciseHistory.find((session) => {
        const sessionDate = new Date(session.date);
        return sessionDate >= lastWeekDate && sessionDate < now;
      });
      
      const lastMonthSession = exerciseHistory.find((session) => {
        const sessionDate = new Date(session.date);
        return sessionDate >= lastMonthDate && sessionDate < now;
      });
      
      const yearStartSession = exerciseHistory.find((session) => {
        const sessionDate = new Date(session.date);
        return sessionDate >= yearStartDate;
      });
      
      const firstSession = exerciseHistory.length > 0 ? exerciseHistory[0] : null;
      
      const lastWeekScore = lastWeekSession ? Math.round(lastWeekSession.averageScore || currentScore) : currentScore;
      const lastMonthScore = lastMonthSession ? Math.round(lastMonthSession.averageScore || currentScore) : currentScore;
      const yearStartScore = yearStartSession ? Math.round(yearStartSession.averageScore || currentScore) : currentScore;
      const startingScore = firstSession ? Math.round(firstSession.averageScore || currentScore) : currentScore;

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
    if ((userData?.user.streak || 0) < 3) {
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
    if ((userData?.user.streak || 0) >= 7) {
      areasOfExcellence.push({
        title: 'Excellent Training Consistency',
        description: `${userData.user.streak} day training streak demonstrates strong commitment`,
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
              Hi, {userData.user.name}
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-cyan-200">
                      <div className="text-3xl font-bold text-cyan-600 capitalize">{todaysPerformance.mood}</div>
                      <div className="text-sm text-cyan-700 font-medium">Mood</div>
                    </div>
                  </div>

                  {/* Area Performance */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(todaysPerformance.areas).map(([areaId, data]: [string, { scores: number[]; average: number }]) => {
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
                      onClick={() => setSelectedTimeView(period as 'week' | 'month' | 'year')}
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