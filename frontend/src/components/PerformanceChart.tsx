import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { TrendingUp, Brain, BarChart3 } from "lucide-react";

interface PerformanceChartProps {
  userData: any;
}

const PerformanceChart = ({ userData }: PerformanceChartProps) => {
  const [timeView, setTimeView] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');

  // Map exercise IDs to cognitive areas
  const exerciseToAreaMap: { [key: string]: string } = {
    'memory': 'Memory',
    'attention': 'Attention',
    'language': 'Language',
    'sequencing': 'Executive Function',
    'mindful-memory': 'Mindful Memory',
    'conversation': 'Social Skills'
  };

  // Color mapping for different cognitive areas
  const areaColors: { [key: string]: string } = {
    'Memory': '#10b981', // green
    'Attention': '#3b82f6', // blue
    'Language': '#f59e0b', // amber
    'Executive Function': '#8b5cf6', // violet
    'Mindful Memory': '#ec4899', // pink
    'Social Skills': '#06b6d4' // cyan
  };

  // Generate chart data based on exercise history and cognitive areas
  const generateChartData = () => {
    const exerciseHistory = userData.exerciseHistory || [];
    
    if (exerciseHistory.length === 0) {
      // Return sample data for demonstration when no history exists
      return [];
    }

    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);

    // Determine date range based on time view
    switch (timeView) {
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'yearly':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }

    // Filter sessions within the selected time period
    const filteredSessions = exerciseHistory.filter((session: any) => {
      const sessionDate = new Date(session.date);
      return sessionDate >= startDate && sessionDate <= endDate;
    });

    // Group exercises by cognitive area and count completed activities
    const areaData: { [key: string]: { completed: number, total: number } } = {};

    filteredSessions.forEach((session: any) => {
      if (session.exercises && Array.isArray(session.exercises)) {
        session.exercises.forEach((exercise: any) => {
          const areaName = exerciseToAreaMap[exercise.exerciseId] || 'Other';
          
          if (!areaData[areaName]) {
            areaData[areaName] = { completed: 0, total: 0 };
          }
          
          areaData[areaName].total++;
          if (!exercise.skipped && exercise.score !== undefined) {
            areaData[areaName].completed++;
          }
        });
      }
    });

    // Convert to chart data format
    const chartData = Object.entries(areaData).map(([area, data]) => {
      return {
        area,
        completed: data.completed,
        total: data.total,
        completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        fill: areaColors[area] || '#6b7280'
      };
    }).filter(item => item.total > 0); // Only show areas with actual data

    return chartData;
  };

  const chartData = generateChartData();

  const getChartTitle = () => {
    switch (timeView) {
      case 'weekly': return 'Activities Completed by Area - Past Week';
      case 'monthly': return 'Activities Completed by Area - Past Month';
      case 'yearly': return 'Activities Completed by Area - Past Year';
      default: return 'Activities Completed by Cognitive Area';
    }
  };

  const getChartDescription = () => {
    switch (timeView) {
      case 'weekly': return 'Number of activities you completed in each cognitive area over the past week';
      case 'monthly': return 'Number of activities you completed in each cognitive area over the past month';
      case 'yearly': return 'Number of activities you completed in each cognitive area over the past year';
      default: return 'Your completed activities in different cognitive areas';
    }
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border-2 border-indigo-200 rounded-lg shadow-lg">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{label}</p>
          <p className="text-lg" style={{ color: data.fill }}>
            Completed: <span className="font-bold">{data.completed}</span> activities
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Total: <span className="font-bold">{data.total}</span> activities
          </p>
          <p className="text-sm text-gray-500">
            Completion Rate: {data.completionRate}%
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
          <Brain className="w-12 h-12 text-indigo-600 mr-3" />
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
            Past Week
          </Button>
          <Button
            variant={timeView === 'monthly' ? 'default' : 'outline'}
            onClick={() => setTimeView('monthly')}
            className="text-lg px-4 py-2"
          >
            Past Month
          </Button>
          <Button
            variant={timeView === 'yearly' ? 'default' : 'outline'}
            onClick={() => setTimeView('yearly')}
            className="text-lg px-4 py-2"
          >
            Past Year
          </Button>
        </div>
        
        <p className="text-lg text-indigo-700 dark:text-indigo-300">
          {getChartDescription()}
        </p>
      </CardHeader>
      
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis 
                  dataKey="area" 
                  tick={{ fontSize: 14, fill: '#4f46e5' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 14, fill: '#4f46e5' }}
                  label={{ 
                    value: 'Activities Completed', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: '16px', fill: '#4f46e5' }
                  }}
                />
                <Bar 
                  dataKey="completed" 
                  radius={[4, 4, 0, 0]}
                  stroke="#374151"
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
              Complete a few training sessions to see your activity count by cognitive area!
            </p>
          </div>
        )}
        
        {/* Summary Stats */}
        {chartData.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-4">
              Your Most Active Areas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chartData
                .sort((a, b) => b.completed - a.completed)
                .slice(0, 3)
                .map((area, index) => (
                  <div 
                    key={area.area}
                    className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border-2"
                    style={{ borderColor: area.fill }}
                  >
                    <div className="text-2xl font-bold mb-1" style={{ color: area.fill }}>
                      {area.completed}
                    </div>
                    <div className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      {area.area}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {area.total} total activities
                    </div>
                    {index === 0 && (
                      <div className="mt-2">
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          🏆 Most Active
                        </span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Color Legend */}
        {chartData.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-3">
              Cognitive Areas
            </h4>
            <div className="flex flex-wrap justify-center gap-4">
              {chartData.map((area) => (
                <div key={area.area} className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: area.fill }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {area.area}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;