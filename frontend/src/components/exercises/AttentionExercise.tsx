import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Eye, Timer } from "lucide-react";

interface AttentionExerciseProps {
  onComplete: (result: any) => void;
  mood: string;
  userPreferences: any;
}

const AttentionExercise = ({ onComplete, mood, userPreferences }: AttentionExerciseProps) => {
  const [phase, setPhase] = useState<'instructions' | 'playing' | 'feedback'>('instructions');
  const [targets, setTargets] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [startTime] = useState(Date.now());
  const [correctClicks, setCorrectClicks] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [gameActive, setGameActive] = useState(false);

  // Adjust difficulty based on mood and experience
  const getDifficulty = () => {
    let targetCount = 15;
    let distractorCount = 25;
    let duration = 30;
    
    if (mood === 'motivated') {
      targetCount = 20;
      distractorCount = 35;
    } else if (mood === 'foggy' || mood === 'tired') {
      targetCount = 10;
      distractorCount = 15;
      duration = 20;
    } else if (mood === 'stressed') {
      targetCount = 8;
      distractorCount = 12;
      duration = 20;
    }
    
    if (userPreferences.experience === 'experienced') {
      targetCount += 5;
      distractorCount += 10;
    } else if (userPreferences.experience === 'beginner') {
      targetCount -= 3;
      distractorCount -= 8;
    }
    
    return { targetCount: Math.max(5, targetCount), distractorCount: Math.max(5, distractorCount), duration };
  };

  const shapes = [
    { type: 'circle', color: 'bg-blue-500', isTarget: true },
    { type: 'square', color: 'bg-red-500', isTarget: false },
    { type: 'triangle', color: 'bg-green-500', isTarget: false },
    { type: 'diamond', color: 'bg-yellow-500', isTarget: false }
  ];

  useEffect(() => {
    if (phase === 'playing' && gameActive) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [phase, gameActive]);

  const generateTargets = () => {
    const { targetCount, distractorCount } = getDifficulty();
    const newTargets = [];
    
    // Add target circles
    for (let i = 0; i < targetCount; i++) {
      newTargets.push({
        id: `target-${i}`,
        type: 'circle',
        color: 'bg-blue-500',
        isTarget: true,
        x: Math.random() * 80 + 5, // 5-85% from left
        y: Math.random() * 70 + 10, // 10-80% from top
        size: Math.random() * 20 + 30 // 30-50px
      });
    }
    
    // Add distractor shapes
    for (let i = 0; i < distractorCount; i++) {
      const shape = shapes[Math.floor(Math.random() * (shapes.length - 1)) + 1]; // Exclude circles
      newTargets.push({
        id: `distractor-${i}`,
        type: shape.type,
        color: shape.color,
        isTarget: false,
        x: Math.random() * 80 + 5,
        y: Math.random() * 70 + 10,
        size: Math.random() * 20 + 30
      });
    }
    
    setTargets(newTargets);
  };

  const startGame = () => {
    const { duration } = getDifficulty();
    setTimeLeft(duration);
    setPhase('playing');
    setGameActive(true);
    generateTargets();
  };

  const handleShapeClick = (target: any) => {
    if (!gameActive) return;
    
    setTotalClicks(prev => prev + 1);
    
    if (target.isTarget) {
      setCorrectClicks(prev => prev + 1);
      // Remove clicked target
      setTargets(prev => prev.filter(t => t.id !== target.id));
    }
  };

  const endGame = () => {
    setGameActive(false);
    const accuracy = totalClicks > 0 ? (correctClicks / totalClicks) * 100 : 0;
    const completionRate = targets.length > 0 ? (correctClicks / targets.filter(t => t.isTarget).length) * 100 : 0;
    const finalScore = (accuracy * 0.6) + (completionRate * 0.4); // Weighted score
    
    setScore(finalScore);
    setPhase('feedback');
    
    setTimeout(() => {
      const result = {
        exerciseId: 'attention',
        score: finalScore,
        timeSpent: Math.round((Date.now() - startTime) / 1000),
        correctClicks,
        totalClicks,
        accuracy,
        completionRate
      };
      onComplete(result);
    }, 3000);
  };

  const renderShape = (target: any) => {
    const baseClasses = `absolute cursor-pointer transition-all duration-200 hover:scale-110 ${target.color}`;
    const style = {
      left: `${target.x}%`,
      top: `${target.y}%`,
      width: `${target.size}px`,
      height: `${target.size}px`
    };

    switch (target.type) {
      case 'circle':
        return (
          <div
            key={target.id}
            className={`${baseClasses} rounded-full`}
            style={style}
            onClick={() => handleShapeClick(target)}
          />
        );
      case 'square':
        return (
          <div
            key={target.id}
            className={`${baseClasses} rounded-sm`}
            style={style}
            onClick={() => handleShapeClick(target)}
          />
        );
      case 'triangle':
        return (
          <div
            key={target.id}
            className={`${baseClasses}`}
            style={{
              ...style,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }}
            onClick={() => handleShapeClick(target)}
          />
        );
      case 'diamond':
        return (
          <div
            key={target.id}
            className={`${baseClasses}`}
            style={{
              ...style,
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
            }}
            onClick={() => handleShapeClick(target)}
          />
        );
      default:
        return null;
    }
  };

  const renderInstructions = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex items-center justify-center">
          <Target className="w-6 h-6 mr-2 text-indigo-600" />
          Attention Training
        </CardTitle>
        <CardDescription className="text-lg">
          Test your selective attention and concentration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Duration: {getDifficulty().duration} seconds
          </Badge>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Your Target:</h3>
          <div className="flex items-center justify-center space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full"></div>
            <span className="text-blue-800 dark:text-blue-200 font-medium">Blue Circles Only!</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 font-bold">1</div>
            <div>
              <h3 className="font-semibold">Find and click blue circles</h3>
              <p className="text-gray-600 dark:text-gray-400">Click only on blue circles, ignore all other shapes</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 font-bold">2</div>
            <div>
              <h3 className="font-semibold">Work quickly but accurately</h3>
              <p className="text-gray-600 dark:text-gray-400">You have limited time, but accuracy is more important than speed</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 font-bold">3</div>
            <div>
              <h3 className="font-semibold">Stay focused</h3>
              <p className="text-gray-600 dark:text-gray-400">Don't get distracted by the other colorful shapes</p>
            </div>
          </div>
        </div>
        
        <Button onClick={startGame} size="lg" className="w-full text-xl py-4">
          Start Attention Training
        </Button>
      </CardContent>
    </Card>
  );

  const renderGame = () => (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Find the Blue Circles!
          </CardTitle>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-lg px-3 py-1">
              <Timer className="w-4 h-4 mr-1" />
              {timeLeft}s
            </Badge>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              Found: {correctClicks}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative bg-gray-50 dark:bg-gray-800 rounded-lg h-96 border-2 border-dashed border-gray-300 dark:border-gray-600">
          {targets.map(target => renderShape(target))}
          
          {targets.filter(t => t.isTarget).length === 0 && gameActive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-green-600 mb-2">Perfect!</h3>
                <p className="text-gray-600 dark:text-gray-400">You found all the blue circles!</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Accuracy: {totalClicks > 0 ? Math.round((correctClicks / totalClicks) * 100) : 0}%
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderFeedback = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {score >= 80 ? 'Excellent Focus!' : score >= 60 ? 'Good Attention!' : 'Keep Practicing!'}
        </CardTitle>
        <CardDescription className="text-lg">
          Your selective attention performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-indigo-600 mb-2">
            {Math.round(score)}%
          </div>
          <Badge 
            variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "outline"}
            className="text-lg px-4 py-2"
          >
            {score >= 80 ? 'Outstanding' : score >= 60 ? 'Well Done' : 'Keep Practicing'}
          </Badge>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{correctClicks}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Targets Found</div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {totalClicks > 0 ? Math.round((correctClicks / totalClicks) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            {score >= 80 
              ? "Your focus is sharp! You successfully filtered out distractions." 
              : score >= 60 
                ? "Good selective attention. With practice, you can improve even more." 
                : "Focus exercises help train your brain to ignore distractions. Keep practicing!"}
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
    case 'playing':
      return renderGame();
    case 'feedback':
      return renderFeedback();
    default:
      return null;
  }
};

export default AttentionExercise;