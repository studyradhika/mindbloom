import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, Eye, MessageSquare, Zap, Puzzle, Gauge, Lightbulb, Grid3X3, ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "@/utils/toast";

interface FocusSelectionProps {
  userName: string;
  todaysMood: string;
}

const FocusSelection = ({ userName, todaysMood }: FocusSelectionProps) => {
  const navigate = useNavigate();
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

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
      } else if (prev.length < 3) {
        return [...prev, areaId];
      } else {
        showError('You can select up to 3 focus areas');
        return prev;
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
    
    showSuccess(`Great! Your ${selectedAreas.length} focus areas are set for today.`);
    
    // Navigate to Activity Dashboard (main dashboard)
    navigate('/dashboard');
  };

  const getMoodBasedRecommendations = () => {
    switch (todaysMood) {
      case 'motivated':
        return ['executive', 'processing', 'creativity'];
      case 'foggy':
        return ['general', 'attention', 'memory'];
      case 'tired':
        return ['general', 'memory', 'attention'];
      case 'stressed':
        return ['general', 'attention', 'memory'];
      default:
        return ['general', 'memory', 'attention'];
    }
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
            Back
          </Button>
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">MindBloom</h1>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleSignOut}
            className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Choose Your Focus Areas
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              Select up to 3 areas you'd like to work on today
            </p>
            <Badge variant="outline" className="text-base px-3 py-1 border-blue-200 text-blue-700">
              {selectedAreas.length}/3 selected
            </Badge>
          </div>

          {/* Mood-based recommendations - Updated to blue theme */}
          <Card className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Lightbulb className="w-4 h-4 mr-2 text-blue-600" />
                Recommended for your mood: {todaysMood}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {recommendations.map(areaId => {
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
            </CardContent>
          </Card>

          {/* Focus area grid - More compact */}
          <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-3 mb-4">
            {focusAreas.map((area) => {
              const IconComponent = area.icon;
              const isSelected = selectedAreas.includes(area.id);
              const isRecommended = recommendations.includes(area.id);
              
              return (
                <Card 
                  key={area.id}
                  className={`cursor-pointer transition-all duration-200 border-2 hover:shadow-md ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : isRecommended
                        ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 hover:border-indigo-400'
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
                    {isRecommended && (
                      <Badge variant="outline" className="mt-2 text-xs bg-indigo-100 text-indigo-800 border-indigo-300">
                        Recommended
                      </Badge>
                    )}
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