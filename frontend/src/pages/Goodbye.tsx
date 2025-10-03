import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Goodbye = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Optional: Set a reminder or cleanup tasks here
    console.log('User signed out at:', new Date().toISOString());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="text-base px-4 py-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center space-x-3">
            <Brain className="h-12 w-12 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">MindBloom</h1>
          </div>
          
          <div className="w-32"></div> {/* Spacer for center alignment */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          {/* Main Thank You Card */}
          <Card className="mb-24 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200">
            <CardContent className="pt-12 pb-12">
              <p className="text-xl text-purple-600 dark:text-purple-300 mb-4">
                Thank you for training with us today! 🧠
              </p>
              
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                We'll see you tomorrow!
              </h2>
              
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Your brain will be ready for another great session.
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button 
              onClick={() => navigate('/')}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg"
            >
              Return to Home
            </Button>
            
            <div className="text-gray-600 dark:text-gray-400">
              <p>Ready to continue? You can always sign back in!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Goodbye;