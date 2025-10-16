import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users, Phone, ShoppingCart } from "lucide-react";

interface ConversationExerciseProps {
  onComplete: (result: any) => void;
  mood: string;
  userPreferences: any;
  exerciseId?: string;
}

const ConversationExercise = ({ onComplete, mood, userPreferences, exerciseId }: ConversationExerciseProps) => {
  const [phase, setPhase] = useState<'instructions' | 'scenario' | 'conversation' | 'feedback'>('instructions');
  const [currentScenario, setCurrentScenario] = useState(0);
  const [conversationStep, setConversationStep] = useState(0);
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [scenarios, setScenarios] = useState<any[]>([]);

  // Real-world conversation scenarios
  const allScenarios = [
    {
      id: 'doctor-appointment',
      title: 'Calling to Schedule a Doctor Appointment',
      icon: Phone,
      difficulty: 1,
      context: "You need to schedule a routine check-up with your doctor.",
      conversation: [
        {
          speaker: 'Receptionist',
          message: "Good morning, Dr. Smith's office. How can I help you?",
          responses: [
            "Hi, I'd like to schedule an appointment for a check-up.",
            "Hello, I need to see the doctor.",
            "Good morning, can I make an appointment?"
          ],
          best: 0
        },
        {
          speaker: 'Receptionist',
          message: "Of course! What type of appointment do you need?",
          responses: [
            "Just a regular check-up, nothing urgent.",
            "I don't know, whatever you have.",
            "A routine physical exam, please."
          ],
          best: 2
        },
        {
          speaker: 'Receptionist',
          message: "Great! I have openings next Tuesday at 2 PM or Thursday at 10 AM. Which works better?",
          responses: [
            "Tuesday at 2 PM would be perfect.",
            "Either one is fine.",
            "Let me think about it and call back."
          ],
          best: 0
        }
      ]
    },
    {
      id: 'grocery-help',
      title: 'Asking for Help at the Grocery Store',
      icon: ShoppingCart,
      difficulty: 1,
      context: "You can't find an item you need at the grocery store.",
      conversation: [
        {
          speaker: 'Store Employee',
          message: "Hi there! You look like you might need some help. What can I do for you?",
          responses: [
            "Yes, thank you! I'm looking for whole wheat pasta but can't find it.",
            "I'm fine, just looking around.",
            "Where is everything in this store?"
          ],
          best: 0
        },
        {
          speaker: 'Store Employee',
          message: "Whole wheat pasta is in aisle 7, about halfway down on the left side.",
          responses: [
            "Thank you so much! I really appreciate your help.",
            "Okay.",
            "Why isn't it with the regular pasta?"
          ],
          best: 0
        }
      ]
    },
    {
      id: 'neighbor-chat',
      title: 'Friendly Chat with a Neighbor',
      icon: Users,
      difficulty: 2,
      context: "You run into your neighbor while getting the mail.",
      conversation: [
        {
          speaker: 'Neighbor',
          message: "Hi! Beautiful day today, isn't it?",
          responses: [
            "Yes, it really is! Perfect weather for being outside.",
            "I guess so.",
            "It's okay, but I heard it might rain later."
          ],
          best: 0
        },
        {
          speaker: 'Neighbor',
          message: "I was just thinking about working in my garden. Do you do any gardening?",
          responses: [
            "I love gardening! I have some tomatoes growing this year.",
            "No, I don't have time for that.",
            "I used to, but it's too much work now."
          ],
          best: 0
        },
        {
          speaker: 'Neighbor',
          message: "That's wonderful! I'd love to see them sometime. Maybe we could share some gardening tips.",
          responses: [
            "That sounds great! Feel free to stop by anytime.",
            "Maybe.",
            "I don't really know much about it."
          ],
          best: 0
        }
      ]
    },
    {
      id: 'restaurant-order',
      title: 'Ordering at a Restaurant',
      icon: MessageCircle,
      difficulty: 2,
      context: "You're at a restaurant and ready to order your meal.",
      conversation: [
        {
          speaker: 'Server',
          message: "Good evening! Have you had a chance to look at the menu?",
          responses: [
            "Yes, I think I'm ready to order.",
            "I need a few more minutes.",
            "What do you recommend?"
          ],
          best: 0
        },
        {
          speaker: 'Server',
          message: "Wonderful! What can I get for you tonight?",
          responses: [
            "I'll have the grilled salmon with vegetables, please.",
            "Give me whatever is popular.",
            "What comes with the chicken?"
          ],
          best: 0
        },
        {
          speaker: 'Server',
          message: "Excellent choice! How would you like that salmon cooked?",
          responses: [
            "Medium, please. And could I get a side salad instead of fries?",
            "However you usually make it.",
            "I don't know, what's normal?"
          ],
          best: 0
        }
      ]
    }
  ];

  // Adjust difficulty based on mood and experience
  const getDifficulty = () => {
    let maxDifficulty = 2;
    let scenarioCount = 2;
    
    if (mood === 'motivated') {
      maxDifficulty = 3;
      scenarioCount = 3;
    } else if (mood === 'foggy' || mood === 'tired' || mood === 'stressed') {
      maxDifficulty = 1;
      scenarioCount = 1;
    }
    
    if (userPreferences.experience === 'experienced') {
      scenarioCount += 1;
    } else if (userPreferences.experience === 'beginner') {
      maxDifficulty = 1;
    }
    
    return { maxDifficulty, scenarioCount: Math.max(1, scenarioCount) };
  };

  useEffect(() => {
    if (phase === 'scenario') {
      generateScenarios();
    }
  }, [phase]);

  const generateScenarios = () => {
    const { maxDifficulty, scenarioCount } = getDifficulty();
    const filteredScenarios = allScenarios.filter(s => s.difficulty <= maxDifficulty);
    
    const shuffled = [...filteredScenarios].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(scenarioCount, shuffled.length));
    
    setScenarios(selected);
    if (selected.length > 0) {
      setCurrentScenario(0);
      setConversationStep(0);
      setPhase('conversation');
    }
  };

  const handleResponseSelect = (responseIndex: number) => {
    const scenario = scenarios[currentScenario];
    const currentStep = scenario.conversation[conversationStep];
    
    setUserResponses(prev => [...prev, currentStep.responses[responseIndex]]);
    
    if (conversationStep < scenario.conversation.length - 1) {
      setConversationStep(conversationStep + 1);
    } else {
      // Move to next scenario or finish
      if (currentScenario < scenarios.length - 1) {
        setCurrentScenario(currentScenario + 1);
        setConversationStep(0);
      } else {
        calculateScore();
      }
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    let responseIndex = 0;
    
    scenarios.forEach(scenario => {
      scenario.conversation.forEach((step: any) => {
        const userResponse = userResponses[responseIndex];
        const bestResponse = step.responses[step.best];
        
        if (userResponse === bestResponse) {
          totalScore += 100;
        } else {
          totalScore += 60; // Partial credit for participating
        }
        responseIndex++;
      });
    });
    
    const averageScore = totalScore / userResponses.length;
    setScore(averageScore);
    setPhase('feedback');
    
    setTimeout(() => {
      const result = {
        exerciseId: exerciseId || 'conversation',
        score: averageScore,
        timeSpent: Math.round((Date.now() - startTime) / 1000),
        scenariosCompleted: scenarios.length,
        category: 'social-communication'
      };
      onComplete(result);
    }, 3000);
  };

  const startExercise = () => {
    setPhase('scenario');
  };

  const renderInstructions = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex items-center justify-center">
          <MessageCircle className="w-6 h-6 mr-2 text-indigo-600" />
          Conversation Practice
        </CardTitle>
        <CardDescription className="text-lg">
          Practice real-world conversations to build confidence in social situations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {getDifficulty().scenarioCount} real-world scenarios
          </Badge>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Why Practice Conversations?</h3>
          <p className="text-blue-700 dark:text-blue-300">
            Social communication can feel challenging after cognitive changes. These exercises help you 
            practice common situations in a safe, supportive environment.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 font-bold">1</div>
            <div>
              <h3 className="font-semibold">Read the scenario</h3>
              <p className="text-gray-600 dark:text-gray-400">Understand the context and your role in the conversation</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 font-bold">2</div>
            <div>
              <h3 className="font-semibold">Choose your responses</h3>
              <p className="text-gray-600 dark:text-gray-400">Select the response that feels most natural and appropriate</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 font-bold">3</div>
            <div>
              <h3 className="font-semibold">Build confidence</h3>
              <p className="text-gray-600 dark:text-gray-400">Practice makes these interactions feel more comfortable in real life</p>
            </div>
          </div>
        </div>
        
        <Button onClick={startExercise} size="lg" className="w-full text-xl py-4">
          Start Conversation Practice
        </Button>
      </CardContent>
    </Card>
  );

  const renderConversation = () => {
    const scenario = scenarios[currentScenario];
    const currentStep = scenario.conversation[conversationStep];
    const IconComponent = scenario.icon;

    return (
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center">
              <IconComponent className="w-5 h-5 mr-2" />
              {scenario.title}
            </CardTitle>
            <Badge variant="outline" className="text-lg px-3 py-1">
              Scenario {currentScenario + 1} of {scenarios.length}
            </Badge>
          </div>
          <CardDescription className="text-lg">
            {scenario.context}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Conversation History */}
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {scenario.conversation.slice(0, conversationStep).map((step: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-xs">
                    <p className="font-semibold text-sm text-gray-600 dark:text-gray-400">{step.speaker}</p>
                    <p>{step.message}</p>
                  </div>
                </div>
                {userResponses[index] && (
                  <div className="flex justify-end">
                    <div className="bg-blue-500 text-white rounded-lg p-3 max-w-xs">
                      <p className="font-semibold text-sm opacity-90">You</p>
                      <p>{userResponses[index]}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Current Message */}
          <div className="border-t pt-4">
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 max-w-md">
                <p className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1">{currentStep.speaker}</p>
                <p className="text-lg">{currentStep.message}</p>
              </div>
            </div>

            {/* Response Options */}
            <div className="space-y-3">
              <p className="font-semibold text-gray-700 dark:text-gray-300">How would you respond?</p>
              {currentStep.responses.map((response: string, index: number) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleResponseSelect(index)}
                  className="w-full text-left justify-start p-4 h-auto whitespace-normal"
                >
                  "{response}"
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderFeedback = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {score >= 90 ? 'Excellent Communication!' : score >= 75 ? 'Great Conversation Skills!' : 'Good Practice!'}
        </CardTitle>
        <CardDescription className="text-lg">
          You've practiced {scenarios.length} real-world conversation{scenarios.length > 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-indigo-600 mb-2">
            {Math.round(score)}%
          </div>
          <Badge 
            variant={score >= 85 ? "default" : score >= 70 ? "secondary" : "outline"}
            className="text-lg px-4 py-2"
          >
            {score >= 85 ? 'Natural Communicator' : score >= 70 ? 'Good Social Skills' : 'Building Confidence'}
          </Badge>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200">
          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
            Social Communication Benefits:
          </h3>
          <ul className="text-green-700 dark:text-green-300 space-y-1">
            <li>• Increased confidence in social situations</li>
            <li>• Better preparation for real conversations</li>
            <li>• Improved social connection and relationships</li>
            <li>• Reduced anxiety about everyday interactions</li>
          </ul>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            {score >= 85 
              ? "Your communication skills are excellent! You show natural social awareness and empathy." 
              : score >= 70 
                ? "Good social instincts. Regular practice will help you feel even more confident in conversations." 
                : "Every conversation is practice. You're building valuable social skills that will serve you well!"}
          </h3>
        </div>
        
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>Moving to next exercise in 3 seconds...</p>
        </div>
      </CardContent>
    </Card>
  );

  switch (phase) {
    case 'instructions':
      return renderInstructions();
    case 'conversation':
      return renderConversation();
    case 'feedback':
      return renderFeedback();
    default:
      return null;
  }
};

export default ConversationExercise;