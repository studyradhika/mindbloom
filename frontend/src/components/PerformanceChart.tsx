import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { TrendingUp, Calendar, BarChart3 } from "lucide-react";

interface PerformanceChartProps {
  userData: any;
}

const PerformanceChart = ({ userData }: PerformanceChartProps) => {
  const [timeView, setTimeView] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');

  // Generate chart data based on exercise history
  const generateChartData = () => {
    const exerciseHistory = userData.exerciseHistory || [];
    
    if (exerciseHistory.length === 0) {
      // Return sample data for demonstration when no history exists
      return {
        weekly: [
          { period: 'This Week', score: 0, sessions: 0 },
          { period: 'Last Week', score: 0, sessions: 0 },
          { period: '2 Weeks Ago', score: 0, sessions: 0 },
          { period: '3 Weeks Ago', score: 0, sessions: 0 }
        ],
        monthly: [
          { period: 'This Month', score: 0, sessions: 0 },
          { period: 'Last Month', score: 0, sessions: 0 },
          { period: '2 Months Ago', score: 0, sessions: 0 }
        ],
        yearly: [
          { period: 'This Year', score: 0, sessions: 0 }
        ]
      };
    }

    const now = new Date();
    
    // Weekly data - last 4 weeks
    const weeklyData = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - (now.getDay()));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekSessions = exerciseHistory.filter((session: any) => {
        const sessionDate = new Date(session.date);
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      });
      
      const avgScore = weekSessions.length > 0 
        ? weekSessions.reduce((sum: number, session: any) => sum + (session.averageScore || 0), 0) / weekSessions.length
        : 0;
      
      const periodLabel = i === 0 ? 'This Week' : 
                         i === 1 ? 'Last Week' : 
                         `${i} Weeks Ago`;
      
      weeklyData.unshift({
        period: periodLabel,
        score: Math.round(avgScore),
        sessions: weekSessions.length
      });
    }

    // Monthly data - last 3 months
    const monthlyData = [];
    for (let i = 0; i < 3; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthSessions = exerciseHistory.filter((session: any) => {
        const sessionDate = new Date(session.date);
        return sessionDate >= monthStart && sessionDate <= monthEnd;
      });
      
      const avgScore = monthSessions.length > 0 
        ? monthSessions.reduce((sum: number, session: any) => sum + (session.averageScore || 0), 0) / monthSessions.length
        : 0;
      
      const periodLabel = i === 0 ? 'This Month' : 
                         i === 1 ? 'Last Month' : 
                         `${i} Months Ago`;
      
      monthlyData.unshift({
        period: periodLabel,
        score: Math.round(avgScore),
        sessions: monthSessions.length
      });
    }

    // Yearly data - this year
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear(), 11, 31);
    
    const yearSessions = exerciseHistory.filter((session: any) => {
      const sessionDate = new Date(session.date);
      return sessionDate >= yearStart && sessionDate <= yearEnd;
    });
    
    const yearAvgScore = yearSessions.length > 0 
      ? yearSessions.reduce((sum: number, session: any) => sum + (session.averageScore || 0), 0) / yearSessions.length
      : 0;
    
    const yearlyData = [{
      period: 'This Year',
      score: Math.round(yearAvgScore),
      sessions: yearSessions.length
    }];

    return {
      weekly: weeklyData,
      monthly: monthlyData,
      yearly: yearlyData
    };
  };

  const chartData = generateChartData();
  const currentData = chartData[timeView];

  const getChartTitle = () => {
    switch (timeView) {
      case 'weekly': return 'Weekly Performance';
      case 'monthly': return 'Monthly Performance';
      case 'yearly': return 'Yearly Performance';
      default: return 'Performance Trends';
    }
  };

  const getChartDescription = () => {
    switch (timeView) {
      case 'weekly': return 'Your average scores over the past 4 weeks';
      case 'monthly': return 'Your average scores over the past 3 months';
      case 'yearly': return 'Your average score for this year';
      default: return 'Your performance over time';
    }
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border-2 border-indigo-200 rounded-lg shadow-lg">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{label}</p>
          <p className="text-lg text-indigo-600">
            Average Score: <span className="font-bold">{data.score}%</span>
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Sessions: <span className="font-bold">{data.sessions}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <BarChart3 className="w-12 h-12 text-indigo-600 mr-3" />
          <CardTitle className="text-2xl text-indigo-800 dark:text-indigo-200">
            {getChartTitle()}
          </CardTitle>
        </div>
        
        {/* Time Period Selector */}
        <div className="flex justify-center space-x-2 mb-4">
          <Button
            variant={timeView === 'weekly' ? 'default' : 'outline'}
            onClick={() => setTimeView('weekly')}
            className="text-lg px-4 py-2"
          >
            Weekly
          </Button>
          <Button
            variant={timeView === 'monthly' ? 'default' : 'outline'}
            onClick={() => setTimeView('monthly')}
            className="text-lg px-4 py-2"
          >
            Monthly
          </Button>
          <Button
            variant={timeView === 'yearly' ? 'default' : 'outline'}
            onClick={() => setTimeView('yearly')}
            className="text-lg px-4 py-2"
          >
            Yearly
          </Button>
        </div>
        
        <p className="text-lg text-indigo-700 dark:text-indigo-300">
          {getChartDescription()}
        </p>
      </CardHeader>
      
      <CardContent>
        {currentData.some(d => d.sessions > 0) ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={currentData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 14, fill: '#4f46e5' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 14, fill: '#4f46e5' }}
                  label={{ 
                    value: 'Average Score (%)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: '16px', fill: '#4f46e5' }
                  }}
                />
                <Bar 
                  dataKey="score" 
                  fill="#4f46e5"
                  radius={[4, 4, 0, 0]}
                  stroke="#3730a3"
                  strokeWidth={2}
                />
                <CustomTooltip />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No Data Yet
            </h3>
            <p className="text-xl text-gray-500 dark:text-gray-500">
              Complete a few training sessions to see your progress trends here!
            </p>
          </div>
        )}
        
        {/* Summary Stats */}
        {currentData.some(d => d.sessions > 0) && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-indigo-200">
              <div className="text-2xl font-bold text-indigo-600">
                {Math.round(currentData.reduce((sum, d) => sum + d.score, 0) / currentData.filter(d => d.sessions > 0).length) || 0}%
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Average Score</div>
            </div>
            
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-indigo-200">
              <div className="text-2xl font-bold text-green-600">
                {currentData.reduce((sum, d) => sum + d.sessions, 0)}
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Total Sessions</div>
            </div>
            
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-indigo-200">
              <div className="text-2xl font-bold text-purple-600">
                {Math.max(...currentData.map(d => d.score))}%
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Best Score</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;