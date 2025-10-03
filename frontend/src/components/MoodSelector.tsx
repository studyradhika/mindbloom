import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Smile, Coffee, Meh, Frown } from "lucide-react";

interface MoodSelectorProps {
  onMoodSelected: (mood: string) => void;
  userName: string;
}

const MoodSelector = ({ onMoodSelected, userName }: MoodSelectorProps) => {
  const moods = [
    {
      id: 'motivated',
      label: 'Motivated',
      icon: Zap,
      description: 'Feeling energized and ready for challenges',
      color: 'hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-900/20',
      iconColor: 'text-green-600'
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
      color: 'hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-900/20',
      iconColor: 'text-orange-600'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to your session! How are you feeling today?
            </h1>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moods.map((mood) => {
              const IconComponent = mood.icon;
              return (
                <Card 
                  key={mood.id}
                  className={`cursor-pointer transition-all duration-200 border-2 ${mood.color} hover:shadow-lg`}
                  onClick={() => onMoodSelected(mood.id)}
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
              onClick={() => onMoodSelected('okay')}
              className="text-lg px-6 py-3"
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