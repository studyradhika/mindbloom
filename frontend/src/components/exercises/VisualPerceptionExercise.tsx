import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Eye, CheckCircle, XCircle } from 'lucide-react';

interface VisualPerceptionExerciseProps {
  onComplete: (result: {
    exerciseId: string;
    score: number;
    timeSpent: number;
    difficulty: string;
    correctIdentifications: number;
    totalTargets: number;
  }) => void;
  difficulty: string;
}

interface Target {
  id: number;
  type: 'circle' | 'square' | 'triangle' | 'diamond';
  color: string;
  size: 'small' | 'medium' | 'large';
  x: number;
  y: number;
  isTarget: boolean;
}

const VisualPerceptionExercise: React.FC<VisualPerceptionExerciseProps> = ({
  onComplete,
  difficulty
}) => {
  const [phase, setPhase] = useState<'instructions' | 'exercise' | 'complete'>('instructions');
  const [targets, setTargets] = useState<Target[]>([]);
  const [targetCriteria, setTargetCriteria] = useState<{type: string; color: string; size: string}>({
    type: '', color: '', size: ''
  });
  const [selectedTargets, setSelectedTargets] = useState<number[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(5);
  const [correctIdentifications, setCorrectIdentifications] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [showFeedback, setShowFeedback] = useState(false);
  const [roundCorrect, setRoundCorrect] = useState(false);

  const shapes = ['circle', 'square', 'triangle', 'diamond'] as const;
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
  const sizes = ['small', 'medium', 'large'] as const;

  const getDifficultySettings = () => {
    switch (difficulty) {
      case 'easy':
        return { targetCount: 3, distractorCount: 8, timeLimit: 15 };
      case 'medium':
        return { targetCount: 4, distractorCount: 12, timeLimit: 12 };
      case 'hard':
        return { targetCount: 5, distractorCount: 16, timeLimit: 10 };
      default:
        return { targetCount: 4, distractorCount: 12, timeLimit: 12 };
    }
  };

  const generateTargets = () => {
    const settings = getDifficultySettings();
    const newTargets: Target[] = [];
    
    // Choose random criteria for targets
    const targetType = shapes[Math.floor(Math.random() * shapes.length)];
    const targetColor = colors[Math.floor(Math.random() * colors.length)];
    const targetSize = sizes[Math.floor(Math.random() * sizes.length)];
    
    setTargetCriteria({ type: targetType, color: targetColor, size: targetSize });

    // Generate target items
    for (let i = 0; i < settings.targetCount; i++) {
      newTargets.push({
        id: i,
        type: targetType,
        color: targetColor,
        size: targetSize,
        x: Math.random() * 80 + 5, // 5-85% to keep within bounds
        y: Math.random() * 70 + 10, // 10-80% to keep within bounds
        isTarget: true
      });
    }

    // Generate distractor items
    for (let i = settings.targetCount; i < settings.targetCount + settings.distractorCount; i++) {
      let distractorType, distractorColor, distractorSize;
      
      // Ensure distractors are different from targets in at least one aspect
      do {
        distractorType = shapes[Math.floor(Math.random() * shapes.length)];
        distractorColor = colors[Math.floor(Math.random() * colors.length)];
        distractorSize = sizes[Math.floor(Math.random() * sizes.length)];
      } while (
        distractorType === targetType && 
        distractorColor === targetColor && 
        distractorSize === targetSize
      );

      newTargets.push({
        id: i,
        type: distractorType,
        color: distractorColor,
        size: distractorSize,
        x: Math.random() * 80 + 5,
        y: Math.random() * 70 + 10,
        isTarget: false
      });
    }

    setTargets(newTargets);
  };

  const startExercise = () => {
    setPhase('exercise');
    setStartTime(Date.now());
    setCurrentRound(1);
    setCorrectIdentifications(0);
    startNewRound();
  };

  const startNewRound = () => {
    generateTargets();
    setSelectedTargets([]);
    setRoundStartTime(Date.now());
    setTimeLeft(getDifficultySettings().timeLimit);
    setShowFeedback(false);
  };

  const handleTargetClick = (targetId: number) => {
    if (showFeedback) return;
    
    setSelectedTargets(prev => {
      if (prev.includes(targetId)) {
        return prev.filter(id => id !== targetId);
      } else {
        return [...prev, targetId];
      }
    });
  };

  const submitRound = () => {
    const actualTargets = targets.filter(t => t.isTarget).map(t => t.id);
    const correctSelections = selectedTargets.filter(id => actualTargets.includes(id));
    const incorrectSelections = selectedTargets.filter(id => !actualTargets.includes(id));
    
    // Perfect identification: all targets found, no incorrect selections
    const isRoundCorrect = correctSelections.length === actualTargets.length && incorrectSelections.length === 0;
    
    if (isRoundCorrect) {
      setCorrectIdentifications(prev => prev + 1);
    }
    
    setRoundCorrect(isRoundCorrect);
    setShowFeedback(true);

    // Auto-advance after showing feedback
    setTimeout(() => {
      if (currentRound < totalRounds) {
        setCurrentRound(prev => prev + 1);
        startNewRound();
      } else {
        completeExercise();
      }
    }, 2000);
  };

  const completeExercise = () => {
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const score = correctIdentifications / totalRounds; // Decimal score (0-1)
    
    console.log('🎯 VisualPerceptionExercise: Completing exercise');
    console.log('   Correct identifications:', correctIdentifications);
    console.log('   Total rounds:', totalRounds);
    console.log('   Score (decimal):', score);
    console.log('   Time spent:', totalTime, 'seconds');

    onComplete({
      exerciseId: 'visual_perception',
      score: score, // Already in decimal format (0-1)
      timeSpent: totalTime,
      difficulty,
      correctIdentifications,
      totalTargets: totalRounds
    });

    setPhase('complete');
  };

  // Timer effect
  useEffect(() => {
    if (phase === 'exercise' && !showFeedback && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showFeedback) {
      submitRound();
    }
  }, [phase, timeLeft, showFeedback]);

  const getShapeComponent = (target: Target) => {
    const sizeMap = { small: 20, medium: 30, large: 40 };
    const size = sizeMap[target.size];
    const isSelected = selectedTargets.includes(target.id);
    const strokeWidth = isSelected ? 3 : 1;
    const stroke = isSelected ? '#000' : '#666';

    const commonProps = {
      fill: target.color,
      stroke,
      strokeWidth,
      style: { cursor: 'pointer' }
    };

    switch (target.type) {
      case 'circle':
        return <circle cx={size/2} cy={size/2} r={size/2 - strokeWidth} {...commonProps} />;
      case 'square':
        return <rect x={strokeWidth} y={strokeWidth} width={size - strokeWidth*2} height={size - strokeWidth*2} {...commonProps} />;
      case 'triangle': {
        const points = `${size/2},${strokeWidth} ${size - strokeWidth},${size - strokeWidth} ${strokeWidth},${size - strokeWidth}`;
        return <polygon points={points} {...commonProps} />;
      }
      case 'diamond': {
        const diamondPoints = `${size/2},${strokeWidth} ${size - strokeWidth},${size/2} ${size/2},${size - strokeWidth} ${strokeWidth},${size/2}`;
        return <polygon points={diamondPoints} {...commonProps} />;
      }
      default:
        return null;
    }
  };

  if (phase === 'instructions') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Eye className="w-8 h-8 text-blue-600 mr-2" />
            <CardTitle className="text-2xl">Visual Perception</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-lg text-gray-700">
              Identify and select visual elements that match specific criteria.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Instructions:</h3>
              <ul className="text-left space-y-2">
                <li>• You'll see various shapes with different colors and sizes</li>
                <li>• Find and click on ALL items that match the given criteria</li>
                <li>• You have {getDifficultySettings().timeLimit} seconds per round</li>
                <li>• Complete {totalRounds} rounds total</li>
                <li>• Click selected items again to deselect them</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600">
              Difficulty: <span className="font-semibold capitalize">{difficulty}</span>
            </p>
          </div>
          <div className="flex justify-center">
            <Button onClick={startExercise} size="lg" className="px-8">
              Start Exercise
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'complete') {
    const finalScore = (correctIdentifications / totalRounds) * 100;
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-green-600">Exercise Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-3xl font-bold text-green-600">
            {finalScore.toFixed(0)}%
          </div>
          <p className="text-lg">
            You correctly identified {correctIdentifications} out of {totalRounds} target sets
          </p>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-800">
              Great work on your visual perception skills!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Eye className="w-6 h-6 text-blue-600 mr-2" />
            <CardTitle>Visual Perception - Round {currentRound}/{totalRounds}</CardTitle>
          </div>
          <div className="text-lg font-semibold">
            Time: {timeLeft}s
          </div>
        </div>
        <Progress value={(currentRound - 1) / totalRounds * 100} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-lg font-semibold">
            Find all: <span className="capitalize text-blue-600">
              {targetCriteria.size} {targetCriteria.color} {targetCriteria.type}s
            </span>
          </p>
        </div>

        <div className="relative bg-gray-50 rounded-lg" style={{ height: '400px' }}>
          {targets.map((target) => (
            <div
              key={target.id}
              className="absolute"
              style={{
                left: `${target.x}%`,
                top: `${target.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => handleTargetClick(target.id)}
            >
              <svg width="50" height="50">
                {getShapeComponent(target)}
              </svg>
            </div>
          ))}
        </div>

        {showFeedback && (
          <div className={`p-4 rounded-lg text-center ${roundCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center justify-center mb-2">
              {roundCorrect ? (
                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 mr-2" />
              )}
              <span className={`font-semibold ${roundCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {roundCorrect ? 'Perfect!' : 'Not quite right'}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {currentRound < totalRounds ? 'Next round starting...' : 'Exercise complete!'}
            </p>
          </div>
        )}

        {!showFeedback && (
          <div className="flex justify-center">
            <Button onClick={submitRound} size="lg">
              Submit Round ({selectedTargets.length} selected)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VisualPerceptionExercise;