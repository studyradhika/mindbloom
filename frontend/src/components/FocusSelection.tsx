import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, Eye, MessageSquare, Zap, Puzzle, Gauge, Lightbulb, Grid3X3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "@/utils/toast";

interface FocusSelectionProps {
  userName: string;
  todaysMood: string;
}

const FocusSelection = ({ userName, todaysMood }: FocusSelectionProps) => {
  const navigate = useNavigate();
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

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
      color: 'text-emerald-600'
    },
    {
      id: 'memory',
      label: 'Memory',
      description: 'Working memory, recall, and retention',
      icon: Brain,
      color: 'text-indigo-600'
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
      color: 'text-blue-700'
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
      color: 'text-emerald-700'
    },
    {
      id: 'creativity',
      label: 'Creativity',
      description: 'Creative thinking and mental flexibility',
      icon: Lightbulb,
      color: 'text-indigo-700'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      {/* Header */}
      <header className="container mx-auto px-4 mb-8">
        <div className="flex items-center justify-center space-x-2">
          <Brain className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MindBloom</h1>
        </div>
      </header>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Focus Areas
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
              Select up to 3 areas you'd like to work on today
            </p>
            <Badge variant="outline" className="text-lg px-4 py-2 border-blue-200 text-blue-700">
              {selectedAreas.length}/3 selected
            </Badge>
          </div>

          {/* Mood-based recommendations */}
          <Card className="mb-8 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-amber-600" />
                Recommended for your mood: {todaysMood}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {recommendations.map(areaId => {
                  const area = focusAreas.find(a => a.id === areaId);
                  return area ? (
                    <Button
                      key={areaId}
                      variant="outline"
                      size="sm"
                      onClick={() => toggleArea(areaId)}
                      className={`border-amber-200 text-amber-700 hover:bg-amber-100 ${selectedAreas.includes(areaId) ? 'bg-amber-100 border-amber-300' : ''}`}
                    >
                      {area.label}
                    </Button>
                  ) : null;
                })}
              </div>
            </CardContent>
          </Card>

          {/* Focus area grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {focusAreas.map((area) => {
              const IconComponent = area.icon;
              const isSelected = selectedAreas.includes(area.id);
              const isRecommended = recommendations.includes(area.id);
              
              return (
                <Card 
                  key={area.id}
                  className={`cursor-pointer transition-all duration-200 border-2 hover:shadow-lg ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : isRecommended
                        ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20 hover:border-amber-400'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                  }`}
                  onClick={() => toggleArea(area.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <IconComponent className={`w-6 h-6 ${area.color}`} />
                        <div className="flex-1">
                          <CardTitle className="text-lg">{area.label}</CardTitle>
                        </div>
                      </div>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleArea(area.id)}
                        className="mt-1"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {area.description}
                    </CardDescription>
                    {isRecommended && (
                      <Badge variant="outline" className="mt-2 text-xs bg-amber-100 text-amber-800 border-amber-300">
                        Recommended
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="text-center">
            <Button 
              onClick={handleNext}
              disabled={selectedAreas.length === 0}
              size="lg"
              className="text-xl px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
            >
              Next - Go to Dashboard
            </Button>
            
            <div className="mt-4 text-gray-600 dark:text-gray-400">
              <p>
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