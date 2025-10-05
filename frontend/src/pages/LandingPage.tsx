import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, ArrowRight, Heart, Shield, Sparkles, Clock, Zap, TrendingUp, Users, Activity, BookOpen, Target, CheckCircle, Star, Award, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('mindbloom-user');
    if (userData) {
      setLoggedInUser(JSON.parse(userData));
    } else {
      setLoggedInUser(null);
    }
  }, []);

  const handleStartJourney = () => {
    navigate('/registration');
  };

  const handleSignIn = () => {
    navigate('/signin');
  };

  const handleGetStarted = () => {
    navigate('/registration');
  };

  const handleSignOut = () => {
    localStorage.removeItem('mindbloom-user');
    localStorage.removeItem('mindbloom-today-mood');
    localStorage.removeItem('mindbloom-last-mood-date');
    localStorage.removeItem('mindbloom-today-focus-areas');
    localStorage.removeItem('mindbloom-last-focus-date');
    localStorage.removeItem('mindbloom-notes');
    localStorage.removeItem('mindbloom-checklists');
    localStorage.removeItem('mindbloom-reminders');
    setLoggedInUser(null); // Clear user from state
    navigate('/'); // Redirect to landing page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                MindBloom
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#benefits" className="text-gray-600 hover:text-blue-600 transition-colors">Benefits</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">About</a>
              
              {loggedInUser ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 font-medium">Hello, {loggedInUser.name}!</span>
                  <Button 
                    variant="ghost" 
                    onClick={handleSignOut}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleSignIn}
                    className="mr-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Badge className="mb-2 bg-gradient-to-r from-blue-100 to-teal-100 text-blue-800 hover:from-blue-100 hover:to-teal-100 border-blue-200">
              Evidence-Based Brain Fitness Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Strengthen Your Mind,<br />
              <span className="bg-gradient-to-r from-blue-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
                Enhance Your Life
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              MindBloom empowers adults to maintain and improve cognitive wellness through personalized, 
              evidence-based brain training exercises. Just 10 minutes a day can help <strong className="text-gray-800 font-semibold">enhance memory, sharpen focus, and boost mental clarity</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleStartJourney}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-3 border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                Take Free Assessment
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              ✓ No credit card required  ✓ Personalized for your needs  ✓ Backed by science
            </p>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="pt-4 pb-12 bg-gradient-to-r from-blue-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your Cognitive Health Matters More Than Ever
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Whether you're experiencing age-related changes, recovering from cognitive trauma, 
              or proactively maintaining mental sharpness, MindBloom provides the tools you need.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center border-blue-100 hover:shadow-lg transition-all hover:border-blue-200">
              <CardHeader className="pb-4">
                <div className="bg-gradient-to-br from-emerald-100 to-green-100 p-4 rounded-full w-fit mx-auto mb-3">
                  <Heart className="h-10 w-10 text-emerald-500" />
                </div>
                <CardTitle className="text-gray-800 text-lg">Health-Conscious Adults</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm">
                  Already investing in physical health? Add mental fitness to your routine with 
                  time-efficient, personalized brain training.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-blue-100 hover:shadow-lg transition-all hover:border-blue-200">
              <CardHeader className="pb-4">
                <div className="bg-gradient-to-br from-blue-100 to-teal-100 p-4 rounded-full w-fit mx-auto mb-3">
                  <Shield className="h-10 w-10 text-blue-500" />
                </div>
                <CardTitle className="text-gray-800 text-lg">Cognitive Recovery</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm">
                  Recovering from surgery, stroke, or TBI? Our adaptive exercises help rebuild 
                  cognitive function with empathy and evidence-based support.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-blue-100 hover:shadow-lg transition-all hover:border-blue-200">
              <CardHeader className="pb-4">
                <div className="bg-gradient-to-br from-indigo-100 to-blue-100 p-4 rounded-full w-fit mx-auto mb-3">
                  <Sparkles className="h-10 w-10 text-indigo-500" />
                </div>
                <CardTitle className="text-gray-800 text-lg">Proactive Wellness</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm">
                  Stay ahead of cognitive changes with daily mental exercises designed to 
                  maintain and enhance your cognitive abilities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Cognitive Wellness Platform
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our evidence-based approach combines AI personalization, progress tracking, 
              and community support to deliver measurable cognitive improvements.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-all border-blue-100 hover:border-blue-200 group">
              <CardHeader>
                <div className="bg-gradient-to-br from-blue-100 to-teal-100 p-3 rounded-lg w-fit group-hover:scale-110 transition-transform">
                  <Clock className="h-10 w-10 text-blue-600" />
                </div>
                <CardTitle className="text-gray-800">10-Minute Daily Activities</CardTitle>
                <CardDescription>Designed for busy schedules - effective brain training that fits into your day</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                    Memory enhancement exercises
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                    Focus and attention training
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                    Executive function development
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all border-blue-100 hover:border-blue-200 group">
              <CardHeader>
                <div className="bg-gradient-to-br from-teal-100 to-indigo-100 p-3 rounded-lg w-fit group-hover:scale-110 transition-transform">
                  <Zap className="h-10 w-10 text-teal-600" />
                </div>
                <CardTitle className="text-gray-800">AI-Powered Personalization</CardTitle>
                <CardDescription>Advanced algorithms adapt to your performance and learning preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                    Difficulty auto-adjustment
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                    Personalized recommendations
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                    Adaptive scheduling
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all border-blue-100 hover:border-blue-200 group">
              <CardHeader>
                <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-3 rounded-lg w-fit group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-10 w-10 text-emerald-600" />
                </div>
                <CardTitle className="text-gray-800">Progress Tracking</CardTitle>
                <CardDescription>Comprehensive analytics to visualize your cognitive improvement journey</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                    Detailed performance reports
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                    Goal setting and tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                    Historical data analysis
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all border-blue-100 hover:border-blue-200 group">
              <CardHeader>
                <div className="bg-gradient-to-br from-indigo-100 to-blue-100 p-3 rounded-lg w-fit group-hover:scale-110 transition-transform">
                  <Users className="h-10 w-10 text-indigo-600" />
                </div>
                <CardTitle className="text-gray-800">Community Support</CardTitle>
                <CardDescription>Connect with others on similar cognitive wellness journeys</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                    Peer support groups
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                    Expert-led webinars
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                    Discussion forums
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all border-blue-100 hover:border-blue-200 group">
              <CardHeader>
                <div className="bg-gradient-to-br from-cyan-100 to-teal-100 p-3 rounded-lg w-fit group-hover:scale-110 transition-transform">
                  <Activity className="h-10 w-10 text-cyan-600" />
                </div>
                <CardTitle className="text-gray-800">Stress Management</CardTitle>
                <CardDescription>Integrated tools to manage stress and optimize cognitive performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                    Mindfulness exercises
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                    Breathing techniques
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                    Stress level tracking
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all border-blue-100 hover:border-blue-200 group">
              <CardHeader>
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-lg w-fit group-hover:scale-110 transition-transform">
                  <BookOpen className="h-10 w-10 text-blue-600" />
                </div>
                <CardTitle className="text-gray-800">Evidence-Based Approach</CardTitle>
                <CardDescription>All exercises grounded in cognitive science and clinical research</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                    Scientifically validated
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                    Clinical outcome tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                    Research-backed methods
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gradient-to-br from-blue-50 via-teal-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Transform Your Cognitive Wellness
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Experience measurable improvements in your daily cognitive performance and overall quality of life.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-blue-100 to-teal-100 p-3 rounded-lg">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Enhanced Focus & Concentration</h3>
                    <p className="text-gray-600">Improve your ability to concentrate on tasks and maintain attention for longer periods.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-3 rounded-lg">
                    <Brain className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Better Memory Retention</h3>
                    <p className="text-gray-600">Strengthen your ability to encode, store, and recall information effectively.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-teal-100 to-indigo-100 p-3 rounded-lg">
                    <Sparkles className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Increased Mental Clarity</h3>
                    <p className="text-gray-600">Experience clearer thinking and improved decision-making capabilities.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-cyan-100 to-blue-100 p-3 rounded-lg">
                    <Heart className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Reduced Cognitive Stress</h3>
                    <p className="text-gray-600">Build resilience against mental fatigue and cognitive overwhelm.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-blue-100">
              <div className="text-center mb-6">
                <div className="bg-gradient-to-br from-amber-100 to-yellow-100 p-4 rounded-full w-fit mx-auto mb-4">
                  <Award className="h-16 w-16 text-amber-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Proven Results</h3>
                <p className="text-gray-600">Users report significant improvements within weeks</p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Memory Performance</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-sm font-semibold text-blue-600">+85%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Focus Duration</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">+78%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Processing Speed</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                    <span className="text-sm font-semibold text-indigo-600">+72%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-600">
              Real stories from people who've transformed their cognitive wellness
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-blue-100 hover:shadow-xl transition-all hover:border-blue-200">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "After my stroke, I thought my sharp mind was gone forever. MindBloom helped me rebuild my confidence and cognitive abilities. The daily exercises are manageable and actually enjoyable."
                </p>
                <div className="font-semibold text-gray-900">Sarah M., 58</div>
                <div className="text-sm text-blue-600">Stroke Recovery</div>
              </CardContent>
            </Card>

            <Card className="text-center border-blue-100 hover:shadow-xl transition-all hover:border-blue-200">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "As a busy executive, I needed something that fit my schedule. The 10-minute sessions are perfect, and I've noticed significant improvements in my focus during long meetings."
                </p>
                <div className="font-semibold text-gray-900">Michael R., 52</div>
                <div className="text-sm text-teal-600">Business Executive</div>
              </CardContent>
            </Card>

            <Card className="text-center border-blue-100 hover:shadow-xl transition-all hover:border-blue-200">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "The brain fog from menopause was affecting my work and confidence. MindBloom's personalized approach helped me regain mental clarity. I feel like myself again!"
                </p>
                <div className="font-semibold text-gray-900">Jennifer L., 49</div>
                <div className="text-sm text-indigo-600">Healthcare Professional</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-teal-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Strengthen Your Mind?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of adults who are already improving their cognitive wellness with MindBloom's evidence-based approach.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleStartJourney}
              size="lg"
              className="text-lg px-8 py-3 bg-white text-blue-600 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-3 border-white text-white hover:bg-white/10 backdrop-blur-sm"
            >
              Schedule Demo
            </Button>
          </div>
          <p className="text-sm mt-4 opacity-75">
            ✓ 14-day free trial  ✓ No commitment  ✓ Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                  MindBloom
                </span>
              </div>
              <p className="text-gray-300 mb-4">
                Evidence-based cognitive wellness platform for adults and those experiencing cognitive challenges.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-blue-300">Platform</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-blue-300 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-300 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-300 transition-colors">Free Trial</a></li>
                <li><a href="#" className="hover:text-blue-300 transition-colors">Mobile App</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-teal-300">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-teal-300 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-teal-300 transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-teal-300 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-teal-300 transition-colors">Clinical Research</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-indigo-300">Company</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-indigo-300 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-indigo-300 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-300 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-indigo-300 transition-colors">HIPAA Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800 mt-8 pt-8 text-center text-gray-300">
            <p>© 2025 MindBloom. All rights reserved. | Empowering cognitive wellness through evidence-based brain training.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;