import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, ArrowLeft, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Benefits = () => {
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

  const handleBack = () => {
    navigate('/');
  };

  const handleStartJourney = () => {
    if (loggedInUser) {
      // Existing users who are logged in -> dashboard
      navigate('/dashboard');
    } else {
      // New users -> registration
      navigate('/auth?mode=register');
    }
  };

  const handleSignInOut = () => {
    if (loggedInUser) {
      // Sign out
      localStorage.removeItem('mindbloom-user');
      localStorage.removeItem('mindbloom-token');
      localStorage.removeItem('mindbloom-today-mood');
      localStorage.removeItem('mindbloom-last-mood-date');
      localStorage.removeItem('mindbloom-today-focus-areas');
      localStorage.removeItem('mindbloom-last-focus-date');
      localStorage.removeItem('mindbloom-notes');
      localStorage.removeItem('mindbloom-checklists');
      localStorage.removeItem('mindbloom-reminders');
      setLoggedInUser(null);
      navigate('/');
    } else {
      // Sign in
      navigate('/signin');
    }
  };

  const cognitiveAreas = [
    {
      id: 'attention',
      title: 'Attention',
      improvement: '15-23% per year',
      description: 'Improved attention & executive function',
      conditions: ['TBI', 'Post-stroke', 'Recovery', 'Aging'],
      institution: 'Harvard Health',
      studyLink: '#',
      color: 'border-l-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'pattern-recognition',
      title: 'Pattern Recognition',
      improvement: '10-20% per year',
      description: 'Increased pattern accuracy, better error monitoring',
      conditions: ['Post-stroke', 'TBI', 'Early dementia', 'Healthy aging'],
      institution: 'Harvard Health',
      studyLink: '#',
      color: 'border-l-green-500',
      bgColor: 'bg-green-50'
    },
    {
      id: 'memory-recall',
      title: 'Memory Recall/Retention',
      improvement: '15-25% per year',
      description: 'Better recall, daily activity independence',
      conditions: ['Mild memory concerns', 'Early dementia', 'Aging', 'Recovery'],
      institution: 'Mayo Clinic',
      studyLink: '#',
      color: 'border-l-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'word-finding',
      title: 'Word Finding',
      improvement: '10-20% per year',
      description: 'Enhanced word retrieval, fluency',
      conditions: ['Post-surgery', 'TBI', 'Stroke', 'Aging'],
      institution: 'Mayo Clinic',
      studyLink: '#',
      color: 'border-l-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'comprehension',
      title: 'Comprehension/Communication',
      improvement: '8-25% per year',
      description: 'Improved comprehension, social participation',
      conditions: ['MCI', 'Aging', 'Post-stroke', 'Dementia'],
      institution: 'AARP GCBH',
      studyLink: '#',
      color: 'border-l-teal-500',
      bgColor: 'bg-teal-50'
    },
    {
      id: 'planning',
      title: 'Planning/Problem Solving',
      improvement: '~20% per year',
      description: 'Increased goal achievement, executive function',
      conditions: ['Recovery', 'Aging', 'Dementia', 'TBI'],
      institution: 'Mayo Clinic',
      studyLink: '#',
      color: 'border-l-indigo-500',
      bgColor: 'bg-indigo-50'
    },
    {
      id: 'visual-spatial',
      title: 'Visual Spatial/Navigation',
      improvement: '~8% per year',
      description: 'Improved navigation and environmental mapping',
      conditions: ['TBI', 'Stroke', 'MCI', 'Early dementia'],
      institution: 'Johns Hopkins',
      studyLink: '#',
      color: 'border-l-pink-500',
      bgColor: 'bg-pink-50'
    },
    {
      id: 'processing-speed',
      title: 'Processing Speed',
      improvement: '5-15% per year (48% risk drop/10 yrs)',
      description: 'Faster reaction time, reduced dementia risk',
      conditions: ['Recovery', 'Aging', 'TBI'],
      institution: 'Harvard Health',
      studyLink: '#',
      color: 'border-l-yellow-500',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 'creative-flexibility',
      title: 'Creative Flexibility',
      improvement: '8-22% per year',
      description: 'More flexible thinking, increased gray matter',
      conditions: ['Mild impairment', 'Aging', 'Post-stroke'],
      institution: 'Mayo Clinic Health System',
      studyLink: '#',
      color: 'border-l-emerald-500',
      bgColor: 'bg-emerald-50'
    }
  ];

  const institutions = [
    { name: 'Harvard Health', subtitle: 'Medical Research', color: 'text-blue-600' },
    { name: 'Mayo Clinic', subtitle: 'Clinical Studies', color: 'text-green-600' },
    { name: 'Johns Hopkins', subtitle: 'Brain Research', color: 'text-purple-600' },
    { name: 'AARP GCBH', subtitle: 'Brain Health', color: 'text-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                Research & Benefits
              </span>
            </div>
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center space-x-2 border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-teal-100 text-blue-800 hover:from-blue-100 hover:to-teal-100 border-blue-200">
            Evidence-Based Training
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Scientifically-Proven <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Cognitive Benefits</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Our training programs are backed by research from leading medical institutions, showing 
            measurable improvements across 9 key cognitive areas.
          </p>
        </div>

        {/* Research Institutions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {institutions.map((institution, index) => (
            <Card key={index} className="text-center p-4 border-blue-100 hover:shadow-lg transition-all">
              <CardContent className="p-0">
                <h3 className={`font-bold text-lg ${institution.color}`}>{institution.name}</h3>
                <p className="text-sm text-gray-600">{institution.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cognitive Training Areas */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">9 Cognitive Training Areas</h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Each area shows proven improvements for various health conditions
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {cognitiveAreas.map((area) => (
              <Card key={area.id} className={`border-l-4 ${area.color} hover:shadow-lg transition-all`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{area.title}</h3>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      {area.improvement}
                    </Badge>
                  </div>
                  
                  <div className={`${area.bgColor} p-3 rounded-lg mb-4`}>
                    <p className="text-gray-700 font-medium">{area.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {area.conditions.map((condition, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {condition}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{area.institution}</span>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Study
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Experience These Benefits?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of users who are already improving their cognitive wellness with our evidence-based training programs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleStartJourney}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
            >
              {loggedInUser ? 'Continue Training' : 'Start Your Journey'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleSignInOut}
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              {loggedInUser ? 'Sign Out' : 'Sign In'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Benefits;