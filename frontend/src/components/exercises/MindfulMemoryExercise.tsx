import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Waves, Brain, Play, Pause } from "lucide-react";

interface MindfulMemoryExerciseProps {
  onComplete: (result: any) => void;
  mood: string;
  userPreferences: any;
}

const MindfulMemoryExercise = ({ onComplete, mood, userPreferences }: MindfulMemoryExerciseProps) => {
  const [phase, setPhase] = useState<'instructions' | 'breathing' | 'memory' | 'integration' | 'feedback'>('instructions');
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingCycle, setBreathingCycle] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingCount, setBreathingCount] = useState(0);
  const [memoryItems, setMemoryItems] = useState<string[]>([]);
  const [userRecall, setUserRecall] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [stressLevel, setStressLevel] = useState(5);
  const breathingTimeoutRef = useState<ReturnType<typeof setTimeout> | null>(null);

  // Calming memory items based on nature and positive themes
  const calmingItems = [
    'Ocean waves', 'Mountain peak', 'Gentle breeze', 'Warm sunlight', 'Peaceful garden',
    'Flowing river', 'Singing birds', 'Soft clouds', 'Blooming flowers', 'Quiet forest',
    'Starry night', 'Morning dew', 'Butterfly wings', 'Cozy fireplace', 'Fresh rain'
  ];

  // Adjust difficulty based on the 'difficulty' prop
  const getDifficultySettings = (difficulty: number) => {
    let itemCount = 6;
    let breathingDuration = 60; // seconds
    
    if (difficulty >= 2.5) {
      itemCount = 8; breathingDuration = 45;
    } else if (difficulty >= 1.5) {
      itemCount = 6; breathingDuration = 60;
    } else { // difficulty < 1.5
      itemCount = 4; breathingDuration = 75;
    }
    
    // Further adjust based on mood for a gentler experience if needed
    if (mood === 'stressed' || mood === 'tired' || mood === 'foggy') {
      itemCount = Math.max(3, itemCount - 1);
      breathingDuration = Math.min(90, breathingDuration + 15);
    }
    
    return { itemCount, breathingDuration };
  };

  useEffect(() => {
    if (breathingActive) {
      const timer = setInterval(() => {
        setBreathingCount(prev => {
          const newCount = prev + 1;
          
          // 4-4-4 breathing pattern (4 seconds each phase)
          if (newCount % 12 === 0) {
            setBreathingCycle('inhale');
          } else if (newCount % 12 === 4) {
            setBreathingCycle('hold');
          } else if (newCount % 12 === 8) {
            setBreathingCycle('exhale');
          }
          
          return newCount;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [breathingActive]);

  const startBreathing = () => {
    setBreathingActive(true);
    setPhase('breathing');
    
    // Auto-transition to memory phase after breathing duration
    const { breathingDuration } = getDifficultySettings(userPreferences.difficulty);
    breathingTimeoutRef.current = setTimeout(() => {
      setBreathingActive(false);
      generateMemoryItems();
      setPhase('memory');
    }, breathingDuration * 1000);
  };

  const generateMemoryItems = () => {
    const { itemCount } = getDifficultySettings(userPreferences.difficulty);
    const shuffled = [...calmingItems].sort(() => Math.random() - 0.5);
    setMemoryItems(shuffled.slice(0, itemCount));
  };

  const handleMemoryComplete = () => {
    setPhase('integration');
    
    // Brief integration phase
    setTimeout(() => {
      calculateScore();
    }, 10000); // 10 seconds of integration
  };

  const calculateScore = () => {
    const correctItems = userRecall.filter(item => memoryItems.includes(item)).length;
    const accuracy = (correctItems / memoryItems.length) * 100;
    
    // Bonus points for stress reduction (simulated)
    const stressReduction = Math.max(0, stressLevel - 3) * 5;
    const finalScore = Math.min(100, accuracy + stressReduction);
    
    setScore(finalScore);
    setPhase('feedback');
    
    setTimeout(() => {
      const result = {
        exerciseId: 'mindful-memory',
        score: finalScore,
        timeSpent: Math.round((Date.now() - startTime) / 1000),
        memoryAccuracy: accuracy,
        stressReduction: stressReduction,
        category: 'mindful-cognitive',
        difficulty: userPreferences.difficulty // Use adaptive difficulty
      };
      onComplete(result);
    }, 3000);
  };

  const addToRecall = (item: string) => {
    if (!userRecall.includes(item)) {
      setUserRecall(prev => [...prev, item]);
    }
  };

  const removeFromRecall = (item: string) => {
    setUserRecall(prev => prev.filter(i => i !== item));
  };

  const renderInstructions = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex items-center justify-center">
          <Heart className="w-6 h-6 mr-2 text-pink-600" />
          Mindful Memory
        </CardTitle>
        <CardDescription className="text-lg">
          Combine gentle breathing with memory training for holistic cognitive wellness
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Breathing + Memory Integration
          </Badge>
        </div>
        
        <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4 border border-pink-200">
          <h3 className="font-semibold text-pink-800 dark:text-pink-200 mb-2">Why Mindful Cognitive Training?</h3>
          <p className="text-pink-700 dark:text-pink-300">
            Stress and anxiety can impact memory and focus. By combining relaxation with cognitive exercises, 
            we create optimal conditions for learning and recall.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center text-pink-600 font-bold">1</div>
            <div>
              <h3 className="font-semibold">Guided breathing</h3>
              <p className="text-gray-600 dark:text-gray-400">Start with calming 4-4-4 breathing to center yourself</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center text-pink-600 font-bold">2</div>
            <div>
              <h3 className="font-semibold">Mindful memorization</h3>
              <p className="text-gray-600 dark:text-gray-400">Study calming, nature-based words while staying relaxed</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center text-pink-600 font-bold">3</div>
            <div>
              <h3 className="font-semibold">Gentle recall</h3>
              <p className="text-gray-600 dark:text-gray-400">Remember the words without pressure or judgment</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            How stressed do you feel right now? (1 = very calm, 10 = very stressed)
          </p>
          <div className="flex justify-center space-x-2">
            {[1,2,3,4,5,6,7,8,9,10].map(level => (
              <Button
                key={level}
                variant={stressLevel === level ? "default" : "outline"}
                size="sm"
                onClick={() => setStressLevel(level)}
                className="w-10 h-10"
              >
                {level}
              </Button>
            ))}
          </div>
        </div>
        
        <Button onClick={startBreathing} size="lg" className="w-full text-xl py-4 bg-pink-600 hover:bg-pink-700">
          Begin Mindful Memory
        </Button>
      </CardContent>
    </Card>
  );

  const renderBreathing = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl flex items-center justify-center">
          <Waves className="w-5 h-5 mr-2" />
          Guided Breathing
        </CardTitle>
        <CardDescription>
          Follow the breathing pattern to center yourself
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="text-center">
          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center text-white font-bold text-xl transition-all duration-1000 ${
            breathingCycle === 'inhale' ? 'bg-blue-500 scale-110' :
            breathingCycle === 'hold' ? 'bg-purple-500 scale-105' :
            'bg-green-500 scale-95'
          }`}>
            {breathingCycle === 'inhale' ? 'Breathe In' :
             breathingCycle === 'hold' ? 'Hold' :
             'Breathe Out'}
          </div>
        </div>

        <div className="text-center space-y-4">
          <p className="text-2xl font-semibold capitalize">{breathingCycle}</p>
          <p className="text-gray-600 dark:text-gray-400">
            {breathingCycle === 'inhale' ? 'Slowly fill your lungs with air' :
             breathingCycle === 'hold' ? 'Gently hold your breath' :
             'Slowly release the air'}
          </p>
          
          <div className="text-sm text-gray-500">
            Breathing cycle: {Math.floor(breathingCount / 12) + 1}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 text-center">
          <p className="text-blue-700 dark:text-blue-300">
            Let your mind become calm and focused. You're preparing your brain for optimal learning.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderMemory = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl flex items-center justify-center">
          <Brain className="w-5 h-5 mr-2" />
          Mindful Memorization
        </CardTitle>
        <CardDescription>
          Study these calming words while maintaining your relaxed state
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {memoryItems.map((item, index) => (
            <div
              key={index}
              className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg text-center border border-green-200"
            >
              <span className="text-lg font-medium text-green-800 dark:text-green-200">
                {item}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 text-center">
          <p className="text-green-700 dark:text-green-300">
            Take your time. Breathe naturally and let these peaceful images settle in your mind.
          </p>
        </div>

        <div className="text-center">
          <Button onClick={handleMemoryComplete} size="lg" className="text-xl px-8 py-4">
            I'm Ready to Recall
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderIntegration = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Gentle Recall</CardTitle>
        <CardDescription>
          Select the words you remember, without any pressure
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-3">
          {[...memoryItems, ...calmingItems.filter(item => !memoryItems.includes(item)).slice(0, 6)].sort(() => Math.random() - 0.5).map((item, index) => (
            <Button
              key={index}
              variant={userRecall.includes(item) ? "default" : "outline"}
              onClick={() => userRecall.includes(item) ? removeFromRecall(item) : addToRecall(item)}
              className="p-3 h-auto text-sm"
            >
              {item}
            </Button>
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Selected: {userRecall.length} words
          </p>
          <p className="text-sm text-gray-500">
            Remember, this is about gentle practice, not perfect performance
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderFeedback = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          Wonderful Practice! 🌸
        </CardTitle>
        <CardDescription className="text-lg">
          You've completed a mindful cognitive session
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-pink-600 mb-2">
            {Math.round(score)}%
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Mindful Achievement
          </Badge>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((userRecall.filter(item => memoryItems.includes(item)).length / memoryItems.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Memory Accuracy</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.max(0, stressLevel - 3)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Stress Reduction</div>
          </div>
        </div>
        
        <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4 border border-pink-200">
          <h3 className="font-semibold text-pink-800 dark:text-pink-200 mb-2">
            Holistic Benefits:
          </h3>
          <ul className="text-pink-700 dark:text-pink-300 space-y-1">
            <li>• Reduced cognitive stress and anxiety</li>
            <li>• Improved memory under relaxed conditions</li>
            <li>• Better mind-body awareness</li>
            <li>• Enhanced emotional regulation</li>
          </ul>
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
    case 'breathing':
      return renderBreathing();
    case 'memory':
      return renderMemory();
    case 'integration':
      return renderIntegration();
    case 'feedback':
      return renderFeedback();
    default:
      return null;
  }
};

export default MindfulMemoryExercise;