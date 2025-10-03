import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SeeYouTomorrow = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set a reminder for tomorrow (this would integrate with notification system in real app)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    console.log('Reminder set for:', tomorrow.toDateString());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center space-x-3">
          <Brain className="h-12 w-12 text-purple-600" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">MindBloom</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          {/* Main Thank You Card */}
          <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200">
            <CardContent className="pt-12 pb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Thank You for Registering!
              </h2>
              
              <p className="text-xl text-purple-600 dark:text-purple-300 mb-4">
                Welcome to the MindBloom community! 🌸
              </p>
              
              <p className="text-xl text-gray-600 dark:text-gray-300">
                See you tomorrow for your first brain training session!
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button 
              onClick={() => navigate('/dashboard')}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg"
            >
              Actually, Let's Start Now! 🚀
            </Button>
            
            <div className="text-gray-600 dark:text-gray-400">
              <p>Changed your mind? You can always start your training today!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SeeYouTomorrow;