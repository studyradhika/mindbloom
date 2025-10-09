import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Legend, Tooltip } from "recharts";
import { TrendingUp, Brain, BarChart3, Calendar, Target } from "lucide-react";

interface PerformanceChartProps {
  userData: any;
}

const PerformanceChart = ({ userData }: PerformanceChartProps) => {
  const [timeView, setTimeView] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [chartType, setChartType] = useState<'performance' | 'activity'>('performance');

  // Cognitive areas mapping
  const cognitiveAreas = [
    { id: 'memory', name: 'Memory', color: '#10b981' },
    { id: 'attention', name: 'Attention', color: '#3b82f6' },
    { id: 'language', name: 'Language', color: '#f59e0b' },
    { id: 'executive', name: 'Executive Function', color: '#8b5cf6' },
    { id: 'creativity', name: 'Creativity', color: '#ec4899' },
    { id: 'processing', name: 'Processing Speed', color: '#06b6d4' },
    { id: 'spatial', name: 'Spatial Reasoning', color: '#84cc16' }
  ];

  // Generate realistic historic performance data
  const generateHistoricData = () => {
    const now = new Date();
    let dataPoints: any[] = [];
    let days = 7;
    let interval = 1; // days
    
    switch (timeView) {
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

    // Generate data points
    if (timeView === 'day') {
      // For day view, generate hourly data points
      for (let hour = 0; hour <= 23; hour++) {
        const date = new Date(now);
        date.setHours(hour, 0, 0, 0);
        
        const dataPoint: any = {
          date: date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true
          }),
          fullDate: date.toISOString()
        };

        // Generate realistic performance scores for each area
        cognitiveAreas.forEach(area => {
          // Base performance with some variation throughout the day
          const baseScore = 65;
          const timeOfDayEffect = Math.sin((hour - 6) * Math.PI / 12) * 10; // Peak around midday
          const hourlyVariation = (Math.random() - 0.5) * 10; // ±5 points variation
          const score = Math.max(0, Math.min(100, baseScore + timeOfDayEffect + hourlyVariation));
          
          dataPoint[area.id] = Math.round(score);
        });

        dataPoints.push(dataPoint);
      }
    } else {
      // For other views, generate daily data points
      for (let i = days; i >= 0; i -= interval) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        const dataPoint: any = {
          date: date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            ...(timeView === 'year' && { year: '2-digit' })
          }),
          fullDate: date.toISOString()
        };

        // Generate realistic performance scores for each area
        cognitiveAreas.forEach(area => {
          // Base performance with some improvement over time and daily variation
          const baseScore = 65;
          const improvement = (days - i) * 0.3; // Gradual improvement
          const dailyVariation = (Math.random() - 0.5) * 15; // ±7.5 points variation
          const score = Math.max(0, Math.min(100, baseScore + improvement + dailyVariation));
          
          dataPoint[area.id] = Math.round(score);
        });

        dataPoints.push(dataPoint);
      }
    }


    return dataPoints;
  };

  // Generate activity count data
  const generateActivityData = () => {
    const historicData = generateHistoricData();
    
    return historicData.map(point => {
      const activityData: any = {
        date: point.date,
        fullDate: point.fullDate
      };

      cognitiveAreas.forEach(area => {
        // Random number of activities (0-3 per area per time period)
        activityData[area.id] = Math.floor(Math.random() * 4);
      });

      return activityData;
    });
  };

  const performanceData = generateHistoricData();
  const activityData = generateActivityData();
  const chartData = chartType === 'performance' ? performanceData : activityData;

  // Get current session areas and their performance
  const getCurrentSessionPerformance = () => {
    const exerciseHistory = userData.exerciseHistory || [];
    const today = new Date().toDateString();
    
    const todaySession = exerciseHistory.find((session: any) => {
      const sessionDate = new Date(session.date).toDateString();
      return sessionDate === today;
    });

    if (todaySession && todaySession.exercises) {
      const areaPerformance: { [key: string]: { scores: number[], average: number } } = {};
      
      todaySession.exercises.forEach((exercise: any) => {
        let areaId = 'general';
        
        // Map exercise IDs to cognitive areas
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
          areaPerformance[areaId] = { scores: [], average: 0 };
        }
        
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

      return areaPerformance;
    }

    return {};
  };

  const currentSessionPerformance = getCurrentSessionPerformance();

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border-2 border-indigo-200 rounded-lg shadow-lg">
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">
                {chartType === 'performance' ? `${entry.value}%` : `${entry.value} activities`}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Current Session Performance */}
      {Object.keys(currentSessionPerformance).length > 0 && (
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-green-600 mr-3" />
              <CardTitle className="text-2xl text-green-800 dark:text-green-200">
                Today's Session Performance
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(currentSessionPerformance).map(([areaId, data]: [string, any]) => {
                const area = cognitiveAreas.find(a => a.id === areaId);
                const areaName = area?.name || areaId;
                const areaColor = area?.color || '#6b7280';
                
                return (
                  <div 
                    key={areaId}
                    className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border-2"
                    style={{ borderColor: areaColor }}
                  >
                    <div className="text-3xl font-bold mb-1" style={{ color: areaColor }}>
                      {data.average}%
                    </div>
                    <div className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      {areaName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {data.scores.length} exercise{data.scores.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Performance Chart */}
      <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-indigo-600 mr-3" />
            <CardTitle className="text-2xl text-indigo-800 dark:text-indigo-200">
              Cognitive Performance Over Time
            </CardTitle>
          </div>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {/* Time Period Selector */}
            <div className="flex space-x-2">
              <Button
                variant={timeView === 'day' ? 'default' : 'outline'}
                onClick={() => setTimeView('day')}
                className="text-sm px-3 py-2"
              >
                Today
              </Button>
              <Button
                variant={timeView === 'week' ? 'default' : 'outline'}
                onClick={() => setTimeView('week')}
                className="text-sm px-3 py-2"
              >
                Past Week
              </Button>
              <Button
                variant={timeView === 'month' ? 'default' : 'outline'}
                onClick={() => setTimeView('month')}
                className="text-sm px-3 py-2"
              >
                Past Month
              </Button>
              <Button
                variant={timeView === 'year' ? 'default' : 'outline'}
                onClick={() => setTimeView('year')}
                className="text-sm px-3 py-2"
              >
                Past Year
              </Button>
            </div>

            {/* Chart Type Selector */}
            <div className="flex space-x-2">
              <Button
                variant={chartType === 'performance' ? 'default' : 'outline'}
                onClick={() => setChartType('performance')}
                className="text-sm px-3 py-2"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Performance
              </Button>
              <Button
                variant={chartType === 'activity' ? 'default' : 'outline'}
                onClick={() => setChartType('activity')}
                className="text-sm px-3 py-2"
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Activity Count
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'performance' ? (
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: '#4f46e5' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#4f46e5' }}
                    domain={[0, 100]}
                    label={{ 
                      value: 'Performance Score (%)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: '14px', fill: '#4f46e5' }
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {cognitiveAreas.slice(0, 4).map((area) => (
                    <Line
                      key={area.id}
                      type="monotone"
                      dataKey={area.id}
                      stroke={area.color}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name={area.name}
                    />
                  ))}
                </LineChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: '#4f46e5' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#4f46e5' }}
                    label={{ 
                      value: 'Activities Completed', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: '14px', fill: '#4f46e5' }
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {cognitiveAreas.slice(0, 4).map((area) => (
                    <Bar
                      key={area.id}
                      dataKey={area.id}
                      fill={area.color}
                      name={area.name}
                    />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Performance Summary */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {cognitiveAreas.slice(0, 4).map((area) => {
              const recentData = chartData.slice(-7); // Last 7 data points
              const scores = recentData.map(d => d[area.id]).filter(s => s > 0);
              const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
              
              return (
                <div key={area.id} className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <div className="text-xl font-bold mb-1" style={{ color: area.color }}>
                    {chartType === 'performance' ? `${avgScore}%` : avgScore}
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {area.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Recent Average
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceChart;