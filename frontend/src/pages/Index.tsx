import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Heart, Target, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [isReturningUser, setIsReturningUser] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const userData = localStorage.getItem('mindbloom-user');
    if (userData) {
      setIsReturningUser(true);
    }
  }, []);

  const handleGetStarted = () => {
    if (isReturningUser) {
      navigate('/dashboard');
    } else {
      navigate('/onboarding');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MindBloom</h1>
          </div>
          {isReturningUser && (
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="text-lg px-6 py-3"
            >
              Continue Training
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Your Brain Deserves
            <span className="text-indigo-600 block">Daily Care</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Evidence-based cognitive training designed for adults 40+. 
            Just 10 minutes a day to keep your mind sharp, focused, and resilient.
          </p>

          <Button 
            onClick={handleGetStarted}
            size="lg"
            className="text-xl px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isReturningUser ? 'Continue Your Journey' : 'Start Your Brain Fitness Journey'}
          </Button>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <Card className="text-center border-2 hover:border-indigo-200 transition-colors">
            <CardHeader>
              <Brain className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Personalized Training</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                AI-powered exercises that adapt to your cognitive needs and progress
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-indigo-200 transition-colors">
            <CardHeader>
              <Target className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <CardTitle className="text-lg">10-Minute Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Quick, effective exercises that fit into your daily routine
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-indigo-200 transition-colors">
            <CardHeader>
              <Heart className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Gentle & Supportive</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Empathetic design with positive feedback and no harsh scoring
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-indigo-200 transition-colors">
            <CardHeader>
              <Users className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Community Support</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Connect with others on similar cognitive wellness journeys
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Accessibility Notice */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Designed with accessibility in mind • Large buttons • High contrast • Keyboard navigation
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;