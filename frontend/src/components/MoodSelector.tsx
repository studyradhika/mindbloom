import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Smile, Coffee, Meh, Frown, ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MoodSelectorProps {
  onMoodSelected: (mood: string) => void;
  userName: string;
}

const MoodSelector = ({ onMoodSelected, userName }: MoodSelectorProps) => {
  const navigate = useNavigate();

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
    // Navigate back to homepage
    navigate('/');
  };

  const moods = [
    {
      id: 'motivated',
      label: 'Motivated',
      icon: Zap,
      description: 'Feeling energized and ready for challenges',
      color: 'hover:bg-teal-50 hover:border-teal-200 dark:hover:bg-teal-900/20',
      iconColor: 'text-teal-600'
    },
    {
      id: 'okay',
      label: 'Okay',
      icon: Smile,
      description: 'Feeling balanced and ready for regular activities',
      color: 'hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20',
      iconColor: 'text-blue-600'
    },
    {
      id: 'foggy',
      label: 'Foggy',
      description: 'Mind feels a bit cloudy, prefer gentler exercises',
      icon: Coffee,
      color: 'hover:bg-indigo-50 hover:border-indigo-200 dark:hover:bg-indigo-900/20',
      iconColor: 'text-indigo-600'
    },
    {
      id: 'tired',
      label: 'Tired',
      icon: Meh,
      description: 'Low energy, need shorter and easier activities',
      color: 'hover:bg-gray-50 hover:border-gray-200 dark:hover:bg-gray-700',
      iconColor: 'text-gray-600'
    },
    {
      id: 'stressed',
      label: 'Stressed',
      icon: Frown,
      description: 'Feeling overwhelmed, could use calming exercises',
      color: 'hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20',
      iconColor: 'text-red-600'
    }
  ];

  const handleMoodSelection = (mood: string) => {
    // Store mood for today
    const today = new Date().toDateString();
    localStorage.setItem('mindbloom-today-mood', mood);
    localStorage.setItem('mindbloom-last-mood-date', today);
    
    // Navigate to focus selection (next step in workflow)
    navigate('/focus-selection');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 py-8">
      {/* Header */}
      <header className="container mx-auto px-4 mb-8">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="px-3 py-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome back, {userName}! How are you feeling today?
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Your mood helps us personalize today's brain training session
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moods.map((mood) => {
              const IconComponent = mood.icon;
              return (
                <Card 
                  key={mood.id}
                  className={`cursor-pointer transition-all duration-200 border-2 ${mood.color} hover:shadow-lg`}
                  onClick={() => handleMoodSelection(mood.id)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4">
                      <IconComponent className={`w-12 h-12 ${mood.iconColor}`} />
                    </div>
                    <CardTitle className="text-xl">{mood.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-base">
                      {mood.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              onClick={() => handleMoodSelection('okay')}
              className="text-lg px-6 py-3 border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              Skip - I'll choose later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodSelector;