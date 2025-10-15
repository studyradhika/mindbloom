import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, Eye, MessageSquare, Zap, Puzzle, Gauge, Lightbulb, Grid3X3, ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "@/utils/toast";
import ProfileSettingsButton from "@/components/ProfileSettingsButton";
import { TrainingSessionManager } from "@/lib/trainingSessionManager";
import { progressAPI, handleAuthError } from "@/lib/api";

interface FocusSelectionProps {
  userName: string;
  todaysMood: string;
}

const FocusSelection = ({ userName, todaysMood }: FocusSelectionProps) => {
  const navigate = useNavigate();
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [improvementAreas, setImprovementAreas] = useState<string[]>([]);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSignOut = () => {
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

  const handleBack = () => {
    // Clear the mood data so user can reselect
    localStorage.removeItem('mindbloom-today-mood');
    localStorage.removeItem('mindbloom-last-mood-date');
    // Navigate back to dashboard which will show mood selector
    navigate('/dashboard');
  };

  const focusAreas = [
    {
      id: 'general',
      label: 'General Cognitive Wellness',
      description: 'Overall brain health and balanced training',
      icon: Brain,
      color: 'text-blue-600'
    },
    {
      id: 'attention',
      label: 'Attention',
      description: 'Focus, concentration, and selective attention',
      icon: Target,
      color: 'text-teal-600'
    },
    {
      id: 'perception',
      label: 'Perception',
      description: 'Visual processing and pattern recognition',
      icon: Eye,
      color: 'text-indigo-600'
    },
    {
      id: 'memory',
      label: 'Memory',
      description: 'Working memory, recall, and retention',
      icon: Brain,
      color: 'text-blue-600'
    },
    {
      id: 'language',
      label: 'Language',
      description: 'Word finding, comprehension, and communication',
      icon: MessageSquare,
      color: 'text-cyan-600'
    },
    {
      id: 'executive',
      label: 'Executive Function',
      description: 'Planning, problem-solving, and decision-making',
      icon: Puzzle,
      color: 'text-indigo-700'
    },
    {
      id: 'spatial',
      label: 'Spatial Reasoning',
      description: 'Visual-spatial skills and navigation',
      icon: Grid3X3,
      color: 'text-teal-700'
    },
    {
      id: 'processing',
      label: 'Processing Speed',
      description: 'Quick thinking and mental agility',
      icon: Gauge,
      color: 'text-blue-700'
    },
    {
      id: 'creativity',
      label: 'Creativity',
      description: 'Creative thinking and mental flexibility',
      icon: Lightbulb,
      color: 'text-indigo-600'
    }
  ];

  const toggleArea = (areaId: string) => {
    setSelectedAreas(prev => {
      if (prev.includes(areaId)) {
        return prev.filter(id => id !== areaId);
      } else {
        return [...prev, areaId];
      }
    });
  };

  const handleNext = () => {
    if (selectedAreas.length === 0) {
      showError('Please select at least one focus area');
      return;
    }

    // Store today's focus areas
    const today = new Date().toDateString();
    localStorage.setItem('mindbloom-today-focus-areas', JSON.stringify(selectedAreas));
    localStorage.setItem('mindbloom-last-focus-date', today);
    
    // Clear any completed areas from pending sessions
    // This will remove areas that the user has now selected for the current session
    TrainingSessionManager.clearCompletedAreasFromPending(selectedAreas);
    
    showSuccess(`Great! Your ${selectedAreas.length} focus areas are set for today.`);
    
    // Navigate to Activity Dashboard (main dashboard)
    navigate('/dashboard');
  };

  // Fetch progress analytics and determine session-based completion status
  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        
        // Get today's performance to see which areas have been worked on today
        const todayPerformance = await progressAPI.getTodayPerformance();
        
        console.log('🎯 FocusSelection: Received today performance:', todayPerformance);
        
        // Get the originally selected focus areas for today's session
        const today = new Date().toDateString();
        const storedFocusAreas = localStorage.getItem('mindbloom-today-focus-areas');
        const lastFocusDate = localStorage.getItem('mindbloom-last-focus-date');
        
        let originallySelectedAreas: string[] = [];
        if (storedFocusAreas && lastFocusDate === today) {
          originallySelectedAreas = JSON.parse(storedFocusAreas);
        }
        
        console.log('🎯 FocusSelection: Originally selected areas:', originallySelectedAreas);
        
        // Areas that have been successfully completed today (have activity data with completed exercises)
        const completedToday: string[] = [];
        const areasYetToPractice: string[] = [];
        
        if (todayPerformance.hasData && todayPerformance.areas) {
          // Check each originally selected area
          originallySelectedAreas.forEach(area => {
            const areaData = todayPerformance.areas[area];
            if (areaData && areaData.scores && areaData.scores.length > 0) {
              // Area has completed exercises
              completedToday.push(area);
            } else {
              // Area was selected but no exercises completed (skipped or time ran out)
              areasYetToPractice.push(area);
            }
          });
        } else {
          // No activity today, all originally selected areas are yet to practice
          areasYetToPractice.push(...originallySelectedAreas);
        }
        
        // Set the state based on session progress
        setStrengths(completedToday);
        setImprovementAreas(areasYetToPractice);
        
        console.log('🎯 FocusSelection: Completed today:', completedToday);
        console.log('🎯 FocusSelection: Areas yet to practice today:', areasYetToPractice);
      } catch (error) {
        console.error('🎯 FocusSelection: Error fetching progress data:', error);
        handleAuthError(error);
        
        // Fallback to local storage system
        setImprovementAreas(getAllPendingAreasFromLocalStorage());
        setStrengths([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  // Fallback function for local storage (kept for backward compatibility)
  const getAllPendingAreasFromLocalStorage = (): string[] => {
    const pendingSessions: { [date: string]: string[] } = TrainingSessionManager.getAllPendingAreasForUser();
    const allPendingAreas: string[] = [];
    
    // Flatten all pending areas from all sessions
    Object.values(pendingSessions).forEach((areas: string[]) => {
      areas.forEach((area: string) => {
        if (!allPendingAreas.includes(area)) {
          allPendingAreas.push(area);
        }
      });
    });
    
    return allPendingAreas;
  };

  const getMoodBasedRecommendations = () => {
    // Get mood-based recommendations
    let moodRecommendations: string[];
    switch (todaysMood) {
      case 'motivated':
        moodRecommendations = ['executive', 'processing', 'creativity'];
        break;
      case 'foggy':
        moodRecommendations = ['general', 'attention', 'memory'];
        break;
      case 'tired':
        moodRecommendations = ['general', 'memory', 'attention'];
        break;
      case 'stressed':
        moodRecommendations = ['general', 'attention', 'memory'];
        break;
      default:
        moodRecommendations = ['general', 'memory', 'attention'];
    }

    // Combine improvement areas (priority) with mood-based recommendations
    // Remove duplicates and prioritize improvement areas
    const combinedRecommendations = [...new Set([...improvementAreas, ...moodRecommendations])];
    
    return combinedRecommendations;
  };

  const recommendations = getMoodBasedRecommendations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 py-4">
      {/* Header - Reduced padding */}
      <header className="container mx-auto px-4 mb-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            className="px-3 py-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Change Mood
          </Button>
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">MindBloom</h1>
          </div>
          <div className="flex items-center space-x-2">
            <ProfileSettingsButton /> {/* Add the settings button here */}
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Sign Out
            </Button>
            <div className="flex items-center justify-center px-3 py-1 bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-medium rounded-full">
              Hi, {userName}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Choose Your Cognitive Focus Areas
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              Select the areas you'd like to work on today
            </p>
          </div>

          {/* Recommendations section */}
          <div className="mb-4 space-y-3">
            {/* Areas needing improvement based on backend analytics */}
            {!loading && improvementAreas.length > 0 && (
              <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200">
                <CardContent className="pt-4">
                  <div className="flex items-center flex-wrap gap-2">
                    <div className="flex items-center">
                      <Target className="w-4 h-4 mr-2 text-orange-600" />
                      <span className="text-base font-medium text-orange-800">Areas Yet to Practice Today:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {improvementAreas.map(areaId => {
                        const area = focusAreas.find(a => a.id === areaId);
                        return area ? (
                          <Button
                            key={areaId}
                            variant="outline"
                            size="sm"
                            onClick={() => toggleArea(areaId)}
                            className={`border-orange-200 text-orange-700 hover:bg-orange-100 text-sm py-1 px-2 h-auto ${selectedAreas.includes(areaId) ? 'bg-orange-100 border-orange-300' : ''}`}
                          >
                            {area.label}
                          </Button>
                        ) : null;
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Areas of strength based on backend analytics */}
            {!loading && strengths.length > 0 && (
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200">
                <CardContent className="pt-4">
                  <div className="flex items-center flex-wrap gap-2">
                    <div className="flex items-center">
                      <Target className="w-4 h-4 mr-2 text-green-600" />
                      <span className="text-base font-medium text-green-800">Completed Today:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {strengths.map(areaId => {
                        const area = focusAreas.find(a => a.id === areaId);
                        return area ? (
                          <Button
                            key={areaId}
                            variant="outline"
                            size="sm"
                            onClick={() => toggleArea(areaId)}
                            className={`border-green-200 text-green-700 hover:bg-green-100 text-sm py-1 px-2 h-auto ${selectedAreas.includes(areaId) ? 'bg-green-100 border-green-300' : ''}`}
                          >
                            {area.label}
                          </Button>
                        ) : null;
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mood-based recommendations */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-center flex-wrap gap-2">
                  <div className="flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="text-base font-medium">Based on your mood and profile:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.filter(areaId => !improvementAreas.includes(areaId) && !strengths.includes(areaId)).map(areaId => {
                      const area = focusAreas.find(a => a.id === areaId);
                      return area ? (
                        <Button
                          key={areaId}
                          variant="outline"
                          size="sm"
                          onClick={() => toggleArea(areaId)}
                          className={`border-blue-200 text-blue-700 hover:bg-blue-100 text-sm py-1 px-2 h-auto ${selectedAreas.includes(areaId) ? 'bg-blue-100 border-blue-300' : ''}`}
                        >
                          {area.label}
                        </Button>
                      ) : null;
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Focus area grid - More compact */}
          <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-3 mb-4">
            {focusAreas.map((area) => {
              const IconComponent = area.icon;
              const isSelected = selectedAreas.includes(area.id);
              const isImprovementArea = improvementAreas.includes(area.id);
              const isStrength = strengths.includes(area.id);
              const isRecommended = recommendations.includes(area.id);
              
              return (
                <Card
                  key={area.id}
                  className={`cursor-pointer transition-all duration-200 border-2 hover:shadow-md ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : isImprovementArea
                        ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20 hover:border-orange-400'
                        : isStrength
                          ? 'border-green-300 bg-green-50 dark:bg-green-900/20 hover:border-green-400'
                          : isRecommended
                            ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:border-blue-400'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                  }`}
                  onClick={() => toggleArea(area.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <IconComponent className={`w-5 h-5 ${area.color}`} />
                        <div className="flex-1">
                          <CardTitle className="text-base">{area.label}</CardTitle>
                        </div>
                      </div>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleArea(area.id)}
                        className="mt-0"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm">
                      {area.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {isImprovementArea && (
                        <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-300">
                          Needs Practice
                        </Badge>
                      )}
                      {isStrength && (
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
                          Your Strength
                        </Badge>
                      )}
                      {isRecommended && !isImprovementArea && !isStrength && (
                        <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-300">
                          Recommended
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Action buttons - Reduced spacing */}
          <div className="text-center">
            <Button 
              onClick={handleNext}
              disabled={selectedAreas.length === 0}
              size="lg"
              className="text-lg px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
            >
              Next - Go to Activity Dashboard
            </Button>
            
            <div className="mt-2 text-gray-600 dark:text-gray-400">
              <p className="text-sm">
                {selectedAreas.length === 0 
                  ? 'Select at least one focus area to continue'
                  : `${selectedAreas.length} focus area${selectedAreas.length > 1 ? 's' : ''} selected`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusSelection;