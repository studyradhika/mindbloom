import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, ArrowLeft, Lightbulb, Heart, Activity, Apple, Moon, Users, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BrainTips = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState('Daily Wellness');
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const topics = [
    { id: 'Daily Wellness', label: 'Daily Wellness', icon: Heart, color: 'text-blue-500' },
    { id: 'Memory Health', label: 'Memory Health', icon: Brain, color: 'text-indigo-500' },
    { id: 'Healthy Living', label: 'Healthy Living', icon: Activity, color: 'text-teal-500' },
    { id: 'Brain Nutrition', label: 'Brain Nutrition', icon: Apple, color: 'text-cyan-500' },
    { id: 'Sleep & Rest', label: 'Sleep & Rest', icon: Moon, color: 'text-blue-600' },
    { id: 'Social Connection', label: 'Social Connection', icon: Users, color: 'text-indigo-600' }
  ];

  const tips = {
    'Daily Wellness': [
      {
        title: 'Start Your Day with Intention',
        content: 'Beginning each day with a moment of mindfulness can improve focus and reduce stress. Take 2-3 deep breaths and set a positive intention for your day.',
        actionStep: 'Try this tomorrow morning before getting out of bed!',
        category: 'Daily Wellness'
      },
      {
        title: 'The Power of Gratitude',
        content: 'Research shows that practicing gratitude can improve mood, reduce stress, and even enhance cognitive function. Spend a few minutes each day reflecting on what you\'re thankful for.',
        actionStep: 'Write down three things you\'re grateful for each evening.',
        category: 'Daily Wellness'
      },
      {
        title: 'Mindful Breathing Breaks',
        content: 'Taking short breathing breaks throughout the day can reset your nervous system and improve mental clarity. Even 30 seconds of focused breathing can make a difference.',
        actionStep: 'Set a reminder to take 3 deep breaths every 2 hours.',
        category: 'Daily Wellness'
      }
    ],
    'Memory Health': [
      {
        title: 'The Method of Loci',
        content: 'Also called the "memory palace" technique, this involves associating information with familiar locations. Ancient Greeks used this method to memorize long speeches.',
        actionStep: 'Try associating your grocery list with rooms in your house.',
        category: 'Memory Health'
      },
      {
        title: 'Spaced Repetition Learning',
        content: 'Reviewing information at increasing intervals helps transfer knowledge from short-term to long-term memory. This technique is highly effective for learning new skills.',
        actionStep: 'Review new information after 1 day, then 3 days, then 1 week.',
        category: 'Memory Health'
      }
    ],
    'Healthy Living': [
      {
        title: 'Exercise for Brain Health',
        content: 'Regular physical activity increases blood flow to the brain and promotes the growth of new brain cells. Even a 20-minute walk can boost cognitive function.',
        actionStep: 'Take a 10-minute walk after lunch today.',
        category: 'Healthy Living'
      }
    ],
    'Brain Nutrition': [
      {
        title: 'Omega-3 Fatty Acids',
        content: 'Found in fish, walnuts, and flaxseeds, omega-3s are essential for brain health. They support memory, mood, and overall cognitive function.',
        actionStep: 'Add a handful of walnuts to your breakfast or snack.',
        category: 'Brain Nutrition'
      }
    ],
    'Sleep & Rest': [
      {
        title: 'The Importance of Deep Sleep',
        content: 'During deep sleep, your brain clears out toxins and consolidates memories. Aim for 7-9 hours of quality sleep each night for optimal brain health.',
        actionStep: 'Create a relaxing bedtime routine starting 1 hour before sleep.',
        category: 'Sleep & Rest'
      }
    ],
    'Social Connection': [
      {
        title: 'Social Engagement and Cognition',
        content: 'Regular social interaction stimulates cognitive function and may help prevent cognitive decline. Meaningful conversations challenge your brain in positive ways.',
        actionStep: 'Schedule a phone call or coffee date with a friend this week.',
        category: 'Social Connection'
      }
    ]
  };

  const currentTips = tips[selectedTopic as keyof typeof tips] || tips['Daily Wellness'];
  const currentTip = currentTips[currentTipIndex];

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
    setCurrentTipIndex(0);
  };

  const handlePreviousTip = () => {
    setCurrentTipIndex(prev => prev > 0 ? prev - 1 : currentTips.length - 1);
  };

  const handleNextTip = () => {
    setCurrentTipIndex(prev => prev < currentTips.length - 1 ? prev + 1 : 0);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Brain className="text-indigo-500" />
              Brain Tips & Wellness
            </h1>
            <p className="text-gray-600 mt-1">Evidence-based insights for cognitive health</p>
          </div>
        </div>

        {/* Featured Tip - More appealing, less bright */}
        <Card className="bg-white shadow-lg border-2 border-indigo-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-indigo-100">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-full">
                <Lightbulb className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-indigo-900">Today's Featured Tip</h2>
                <p className="text-indigo-700 text-sm">Daily wisdom for cognitive wellness</p>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">The Method of Loci</h3>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Also called the "memory palace" technique, this involves associating information with familiar locations. 
              Ancient Greeks used this method to memorize long speeches.
            </p>
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold text-lg">💡</span>
                <div>
                  <p className="font-semibold text-yellow-800 mb-1">Try this:</p>
                  <p className="text-yellow-700">Try associating your grocery list with rooms in your house.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Tip Content */}
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const topic = topics.find(t => t.id === selectedTopic);
                  const IconComponent = topic?.icon || Heart;
                  return <IconComponent className={`w-8 h-8 ${topic?.color || 'text-blue-500'}`} />;
                })()}
                <div>
                  <CardTitle className="text-2xl">{currentTip.title}</CardTitle>
                  <Badge variant="secondary" className="mt-1 bg-indigo-100 text-indigo-800">{currentTip.category}</Badge>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {currentTipIndex + 1} of {currentTips.length}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-700 leading-relaxed text-lg">
              {currentTip.content}
            </p>

            {/* Action Step */}
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
              <h4 className="font-semibold text-blue-800 mb-2">💡 Action Step:</h4>
              <p className="text-blue-700">{currentTip.actionStep}</p>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4">
              <Button 
                variant="outline" 
                onClick={handlePreviousTip}
                className="flex items-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <div className="flex gap-2">
                {currentTips.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentTipIndex ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <Button 
                variant="outline" 
                onClick={handleNextTip}
                className="flex items-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                Next
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Personalized Recommendations */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="text-teal-500" />
              Personalized for You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                <h4 className="font-semibold text-teal-800 mb-2">Stress Management</h4>
                <p className="text-teal-700 text-sm">
                  Try the breathing exercises and stress reduction tips in our Daily Wellness section.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Topic Exploration - Moved to bottom */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Explore Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {topics.map((topic) => {
                const IconComponent = topic.icon;
                const isSelected = selectedTopic === topic.id;
                return (
                  <Button
                    key={topic.id}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handleTopicSelect(topic.id)}
                    className={`flex flex-col items-center gap-2 h-auto p-4 ${
                      isSelected 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                        : 'hover:bg-indigo-50 hover:text-indigo-700 border-indigo-200'
                    }`}
                  >
                    <IconComponent className={`w-6 h-6 ${isSelected ? 'text-white' : topic.color}`} />
                    <span className="text-sm">{topic.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Motivational Footer */}
        <Card className="bg-gradient-to-r from-teal-500 to-blue-600 text-white">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Knowledge is Power! 🧠</h3>
            <p className="opacity-90">
              Every small step you take toward better brain health makes a difference. 
              You're investing in your cognitive future with every healthy choice.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BrainTips;