import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Users, Trophy, Star, MessageSquare, Shield, Clock, Play, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    // Check if user is already registered
    const userData = localStorage.getItem('mindbloom-user');
    if (userData) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSignIn = () => {
    // For demo purposes, just navigate to dashboard
    // In a real app, this would validate credentials
    navigate('/dashboard');
  };

  const handleSignUp = () => {
    navigate('/registration');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-900 whitespace-nowrap">MindBloom</h1>
              <p className="text-lg text-gray-600 whitespace-nowrap">Keep Your Mind Sharp & Healthy</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center py-16 max-w-4xl mx-auto">
          <h2 className="text-xl text-gray-900 mb-6 whitespace-nowrap text-center">
            Scientifically-designed exercises by brain health experts to boost memory, improve focus, and keep your mind active.
          </h2>
          <p className="text-xl text-gray-600 mb-8 whitespace-nowrap">
            Just 30 minutes a day that can make a real difference. Start your journey to lifelong mental fitness today!
          </p>
          
          <div className="flex flex-col gap-4 justify-center items-center">
            <Button 
              onClick={handleSignIn}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
            >
              Already Registered? Sign In →
            </Button>
            <Button 
              onClick={handleSignUp}
              variant="outline"
              size="lg"
              className="border-2 border-orange-200 bg-orange-100 hover:bg-orange-200 text-gray-800 px-8 py-4 text-lg"
            >
              New User? Sign Up Free
            </Button>
          </div>
        </div>
      </main>

      {/* What You'll Get Section */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12 whitespace-nowrap">What You'll Get</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold mb-3 whitespace-nowrap">Easy To Use</h4>
              <p className="text-gray-600">
                Three quick exercises each day targeting memory, problem-solving, and creativity.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-3 whitespace-nowrap">Safe & Private</h4>
              <p className="text-gray-600">
                Your personal data stays secure and private. No complicated setup required.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="text-xl font-semibold mb-3 whitespace-nowrap">Just 10 Minutes Each</h4>
              <p className="text-gray-600">
                Short, engaging exercises that fit easily into your daily routine.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold mb-3 whitespace-nowrap">See Your Growth</h4>
              <p className="text-gray-600">
                Track streaks and celebrate milestones to stay motivated.
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4">
        {/* Community Section */}
        <div className="py-16 bg-white rounded-2xl my-16">
          <div className="max-w-6xl mx-auto px-8">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-4 whitespace-nowrap">Join a Supportive Community</h3>
            <p className="text-xl text-gray-600 text-center mb-12 whitespace-nowrap">
              Connect with thousands of adults on similar cognitive health journeys
            </p>
            
            {/* Community Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <Card>
                <CardContent className="text-center p-6">
                  <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">12,847</div>
                  <div className="text-gray-600 whitespace-nowrap">Active Members</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="text-center p-6">
                  <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">89,234</div>
                  <div className="text-gray-600 whitespace-nowrap">Challenges Completed</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="text-center p-6">
                  <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">2,156</div>
                  <div className="text-gray-600 whitespace-nowrap">Success Stories</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="text-center p-6">
                  <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">456</div>
                  <div className="text-gray-600 whitespace-nowrap">Daily Discussions</div>
                </CardContent>
              </Card>
            </div>

            {/* Testimonials */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-3"></div>
                    <div>
                      <div className="font-semibold">Margaret S.</div>
                      <div className="text-gray-600 text-sm">Age 67</div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic mb-4">
                    "My memory has improved so much! I can remember names and appointments better than I have in years."
                  </p>
                  <div className="text-green-600 font-semibold">+23% Memory Score</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-3"></div>
                    <div>
                      <div className="font-semibold">Robert K.</div>
                      <div className="text-gray-600 text-sm">Age 72</div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic mb-4">
                    "The community support keeps me motivated. It's wonderful to share progress with peers who understand."
                  </p>
                  <div className="text-green-600 font-semibold">+18% Focus Score</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-3"></div>
                    <div>
                      <div className="font-semibold">Linda M.</div>
                      <div className="text-gray-600 text-sm">Age 58</div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic mb-4">
                    "I love how the exercises adapt to my level. Never too easy, never too frustrating - just right!"
                  </p>
                  <div className="text-green-600 font-semibold">+31% Processing Speed</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="text-center py-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-6 whitespace-nowrap">
            Excited for Keeping Your Mind Sharp?
          </h3>
          <Button 
            onClick={handleSignUp}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg mb-4"
          >
            Get Started For Free →
          </Button>
          <p className="text-gray-600">
            No credit card required • Start immediately
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;