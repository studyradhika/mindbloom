import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, ArrowRight, Heart, Shield, Sparkles, Clock, Zap, TrendingUp, Users, Activity, BookOpen, Target, CheckCircle, Star, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStartJourney = () => {
    navigate('/mindbloom');
  };

  const handleSignIn = () => {
    navigate('/mindbloom');
  };

  const handleGetStarted = () => {
    navigate('/mindbloom');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                MindBloom
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">Features</a>
              <a href="#benefits" className="text-gray-600 hover:text-purple-600 transition-colors">Benefits</a>
              <a href="#about" className="text-gray-600 hover:text-purple-600 transition-colors">About</a>
              <Button 
                variant="outline" 
                onClick={handleSignIn}
                className="mr-2 border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                Sign In
              </Button>
              <Button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Badge className="mb-4 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 hover:from-purple-100 hover:to-pink-100 border-purple-200">
              Evidence-Based Brain Fitness Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Strengthen Your Mind,<br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                Enhance Your Life
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              MindBloom empowers adults 40+ to maintain and improve cognitive wellness through personalized, 
              evidence-based brain training exercises. Just 10 minutes a day can help enhance memory, focus, and mental clarity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleStartJourney}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-3 border-purple-200 text-purple-600 hover:bg-purple-50"
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
      <section className="py-16 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your Cognitive Health Matters More Than Ever
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Whether you're experiencing age-related changes, recovering from cognitive trauma, 
              or proactively maintaining mental sharpness, MindBloom provides the tools you need.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-purple-100 hover:shadow-lg transition-all hover:border-purple-200">
              <CardHeader>
                <div className="bg-gradient-to-br from-red-100 to-pink-100 p-4 rounded-full w-fit mx-auto mb-4">
                  <Heart className="h-12 w-12 text-red-500" />
                </div>
                <CardTitle className="text-gray-800">Health-Conscious Adults 40+</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Already investing in physical health? Add mental fitness to your routine with 
                  time-efficient, personalized brain training.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-purple-100 hover:shadow-lg transition-all hover:border-purple-200">
              <CardHeader>
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-full w-fit mx-auto mb-4">
                  <Shield className="h-12 w-12 text-green-500" />
                </div>
                <CardTitle className="text-gray-800">Cognitive Recovery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Recovering from surgery, stroke, or TBI? Our adaptive exercises help rebuild 
                  cognitive function with empathy and evidence-based support.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-purple-100 hover:shadow-lg transition-all hover:border-purple-200">
              <CardHeader>
                <div className="bg-gradient-to-br from-purple-100 to-indigo-100 p-4 rounded-full w-fit mx-auto mb-4">
                  <Sparkles className="h-12 w-12 text-purple-500" />
                </div>
                <CardTitle className="text-gray-800">Proactive Wellness</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
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
            <Card className="hover:shadow-xl transition-all border-purple-100 hover:border-purple-200 group">
              <CardHeader>
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-3 rounded-lg w-fit group-hover:scale-110 transition-transform">
                  <Clock className="h-10 w-10 text-purple-600" />
                </div>
                <CardTitle className="text-gray-800">10-Minute Daily Activities</CardTitle>
                <CardDescription>Designed for busy schedules - effective brain training that fits into your day</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Memory enhancement exercises
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Focus and attention training
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Executive function development
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all border-purple-100 hover:border-purple-200 group">
              <CardHeader>
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-3 rounded-lg w-fit group-hover:scale-110 transition-transform">
                  <Zap className="h-10 w-10 text-purple-600" />
                </div>
                <CardTitle className="text-gray-800">AI-Powered Personalization</CardTitle>
                <CardDescription>Advanced algorithms adapt to your performance and learning preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Difficulty auto-adjustment
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Personalized recommendations
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Adaptive scheduling
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all border-purple-100 hover:border-purple-200 group">
              <CardHeader>
                <div className="bg-gradient-to-br from-green-100 to-teal-100 p-3 rounded-lg w-fit group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle className="text-gray-800">Progress Tracking</CardTitle>
                <CardDescription>Comprehensive analytics to visualize your cognitive improvement journey</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Detailed performance reports
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Goal setting and tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Historical data analysis
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all border-purple-100 hover:border-purple-200 group">
              <CardHeader>
                <div className="bg-gradient-to-br from-orange-100 to-pink-100 p-3 rounded-lg w-fit group-hover:scale-110 transition-transform">
                  <Users className="h-10 w-10 text-orange-600" />
                </div>
                <CardTitle className="text-gray-800">Community Support</CardTitle>
                <CardDescription>Connect with others on similar cognitive wellness journeys</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Peer support groups
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Expert-led webinars
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Discussion forums
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all border-purple-100 hover:border-purple-200 group">
              <CardHeader>
                <div className="bg-gradient-to-br from-red-100 to-pink-100 p-3 rounded-lg w-fit group-hover:scale-110 transition-transform">
                  <Activity className="h-10 w-10 text-red-600" />
                </div>
                <CardTitle className="text-gray-800">Stress Management</CardTitle>
                <CardDescription>Integrated tools to manage stress and optimize cognitive performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Mindfulness exercises
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Breathing techniques
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Stress level tracking
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all border-purple-100 hover:border-purple-200 group">
              <CardHeader>
                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-3 rounded-lg w-fit group-hover:scale-110 transition-transform">
                  <BookOpen className="h-10 w-10 text-indigo-600" />
                </div>
                <CardTitle className="text-gray-800">Evidence-Based Approach</CardTitle>
                <CardDescription>All exercises grounded in cognitive science and clinical research</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Scientifically validated
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Clinical outcome tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Research-backed methods
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
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
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-3 rounded-lg">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Enhanced Focus & Concentration</h3>
                    <p className="text-gray-600">Improve your ability to concentrate on tasks and maintain attention for longer periods.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-green-100 to-teal-100 p-3 rounded-lg">
                    <Brain className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Better Memory Retention</h3>
                    <p className="text-gray-600">Strengthen your ability to encode, store, and recall information effectively.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-3 rounded-lg">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Increased Mental Clarity</h3>
                    <p className="text-gray-600">Experience clearer thinking and improved decision-making capabilities.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-orange-100 to-pink-100 p-3 rounded-lg">
                    <Heart className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Reduced Cognitive Stress</h3>
                    <p className="text-gray-600">Build resilience against mental fatigue and cognitive overwhelm.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-purple-100">
              <div className="text-center mb-6">
                <div className="bg-gradient-to-br from-yellow-100 to-orange-100 p-4 rounded-full w-fit mx-auto mb-4">
                  <Award className="h-16 w-16 text-yellow-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Proven Results</h3>
                <p className="text-gray-600">Users report significant improvements within weeks</p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Memory Performance</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-sm font-semibold text-purple-600">+85%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Focus Duration</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                    <span className="text-sm font-semibold text-green-600">+78%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Processing Speed</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{ width: '72%' }}></div>
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
            <Card className="text-center border-purple-100 hover:shadow-xl transition-all hover:border-purple-200">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "After my stroke, I thought my sharp mind was gone forever. MindBloom helped me rebuild my confidence and cognitive abilities. The daily exercises are manageable and actually enjoyable."
                </p>
                <div className="font-semibold text-gray-900">Sarah M., 58</div>
                <div className="text-sm text-purple-600">Stroke Recovery</div>
              </CardContent>
            </Card>

            <Card className="text-center border-purple-100 hover:shadow-xl transition-all hover:border-purple-200">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "As a busy executive, I needed something that fit my schedule. The 10-minute sessions are perfect, and I've noticed significant improvements in my focus during long meetings."
                </p>
                <div className="font-semibold text-gray-900">Michael R., 52</div>
                <div className="text-sm text-purple-600">Business Executive</div>
              </CardContent>
            </Card>

            <Card className="text-center border-purple-100 hover:shadow-xl transition-all hover:border-purple-200">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "The brain fog from menopause was affecting my work and confidence. MindBloom's personalized approach helped me regain mental clarity. I feel like myself again!"
                </p>
                <div className="font-semibold text-gray-900">Jennifer L., 49</div>
                <div className="text-sm text-purple-600">Healthcare Professional</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Strengthen Your Mind?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of adults who are already improving their cognitive wellness with MindBloom's evidence-based approach.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleStartJourney}
              size="lg"
              className="text-lg px-8 py-3 bg-white text-purple-600 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all"
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
      <footer className="bg-gradient-to-r from-gray-900 to-purple-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-8 w-8 text-purple-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  MindBloom
                </span>
              </div>
              <p className="text-gray-300 mb-4">
                Evidence-based cognitive wellness platform for adults 40+ and those experiencing cognitive challenges.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-purple-300">Platform</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-purple-300 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-purple-300 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-purple-300 transition-colors">Free Trial</a></li>
                <li><a href="#" className="hover:text-purple-300 transition-colors">Mobile App</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-purple-300">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-purple-300 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-purple-300 transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-purple-300 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-purple-300 transition-colors">Clinical Research</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-purple-300">Company</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-purple-300 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-purple-300 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-purple-300 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-purple-300 transition-colors">HIPAA Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-800 mt-8 pt-8 text-center text-gray-300">
            <p>© 2024 MindBloom. All rights reserved. | Empowering cognitive wellness through evidence-based brain training.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;