import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Eye, EyeOff, Hash, Shapes, Type, Grid3X3 } from "lucide-react";

interface MemoryExerciseProps {
  onComplete: (result: any) => void;
  mood: string;
  userPreferences: any;
}

type ExerciseType = 'numbers' | 'shapes' | 'words' | 'patterns';

const MemoryExercise = ({ onComplete, mood, userPreferences }: MemoryExerciseProps) => {
  const [phase, setPhase] = useState<'instructions' | 'memorize' | 'recall' | 'feedback'>('instructions');
  const [exerciseType, setExerciseType] = useState<ExerciseType>('numbers');
  const [sequence, setSequence] = useState<any[]>([]);
  const [userSequence, setUserSequence] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [showingSequence, setShowingSequence] = useState(false);

  // Adjust difficulty based on the 'difficulty' prop
  const getSequenceLength = (difficulty: number) => {
    let length = 4; // Base length
    if (difficulty >= 2.5) {
      length = 7;
    } else if (difficulty >= 1.5) {
      length = 5;
    } else { // difficulty < 1.5
      length = 3;
    }

    // Further adjust based on mood for a gentler experience if needed
    if (mood === 'foggy' || mood === 'tired' || mood === 'stressed') {
      length = Math.max(3, length - 1);
    }
    return length;
  };

  // Exercise type definitions
  const exerciseTypes = {
    numbers: {
      name: 'Number Sequence',
      icon: Hash,
      items: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      getDisplay: (item: number) => item.toString(),
      className: 'bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl'
    },
    shapes: {
      name: 'Shape Memory',
      icon: Shapes,
      items: ['●', '■', '▲', '♦', '★', '♠', '♥', '♣', '◆'],
      getDisplay: (item: string) => item,
      className: 'bg-green-500 hover:bg-green-600 text-white font-bold text-2xl'
    },
    words: {
      name: 'Word Recall',
      icon: Type,
      items: ['CAT', 'DOG', 'SUN', 'MOON', 'TREE', 'FISH', 'BIRD', 'STAR', 'BOOK'],
      getDisplay: (item: string) => item,
      className: 'bg-purple-500 hover:bg-purple-600 text-white font-semibold text-sm'
    },
    patterns: {
      name: 'Pattern Memory',
      icon: Grid3X3,
      items: ['⚡', '🌟', '🔥', '💧', '🌙', '☀️', '❄️', '🌈', '⭐'],
      getDisplay: (item: string) => item,
      className: 'bg-orange-500 hover:bg-orange-600 text-white text-xl'
    }
  };

  // Randomly select exercise type on component mount
  useEffect(() => {
    const types: ExerciseType[] = ['numbers', 'shapes', 'words', 'patterns'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    setExerciseType(randomType);
  }, []);

  useEffect(() => {
    if (phase === 'memorize') {
      generateSequence();
    }
  }, [phase, userPreferences.difficulty, mood, exerciseType]);

  const generateSequence = () => {
    const length = getSequenceLength(userPreferences.difficulty);
    const currentExercise = exerciseTypes[exerciseType];
    
    const newSequence = Array.from({ length }, () =>
      currentExercise.items[Math.floor(Math.random() * currentExercise.items.length)]
    );
    
    setSequence(newSequence);
    showSequence(newSequence);
  };

  const showSequence = async (seq: any[]) => {
    setShowingSequence(true);
    
    for (let i = 0; i < seq.length; i++) {
      setCurrentIndex(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setShowingSequence(false);
    setCurrentIndex(-1);
    
    // Wait a moment then start recall phase
    setTimeout(() => {
      setPhase('recall');
    }, 500);
  };

  const handleItemClick = (item: any) => {
    if (phase !== 'recall') return;
    
    const newUserSequence = [...userSequence, item];
    setUserSequence(newUserSequence);
    
    if (newUserSequence.length === sequence.length) {
      calculateScore(newUserSequence);
    }
  };

  const calculateScore = (userSeq: any[]) => {
    // Position-based scoring (exact sequence match)
    let positionCorrect = 0;
    for (let i = 0; i < sequence.length; i++) {
      if (sequence[i] === userSeq[i]) positionCorrect++;
    }
    
    // Content-based scoring (right items, any position)
    let contentCorrect = 0;
    const sequenceCopy = [...sequence];
    const userSeqCopy = [...userSeq];
    
    for (let i = 0; i < userSeqCopy.length; i++) {
      const itemIndex = sequenceCopy.indexOf(userSeqCopy[i]);
      if (itemIndex !== -1) {
        contentCorrect++;
        sequenceCopy.splice(itemIndex, 1); // Remove to avoid double counting
      }
    }
    
    // Weighted scoring: 70% for position accuracy, 30% for content accuracy
    const positionScore = (positionCorrect / sequence.length) * 70;
    const contentScore = (contentCorrect / sequence.length) * 30;
    const percentage = Math.round(positionScore + contentScore);
    
    setScore(percentage);
    setPhase('feedback');
    
    setTimeout(() => {
      const result = {
        exerciseId: 'memory_sequence',
        score: percentage / 100, // Convert to decimal for backend
        timeSpent: Math.round((Date.now() - startTime) / 1000),
        difficulty: userPreferences.difficulty,
        exerciseType: exerciseType,
        correct: positionCorrect,
        total: sequence.length,
        positionCorrect,
        contentCorrect
      };
      onComplete(result);
    }, 3000);
  };

  const startExercise = () => {
    setPhase('memorize');
  };

  const renderInstructions = () => {
    const currentExercise = exerciseTypes[exerciseType];
    const IconComponent = currentExercise.icon;
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center">
            <IconComponent className="w-6 h-6 mr-2 text-indigo-600" />
            {currentExercise.name}
          </CardTitle>
          <CardDescription className="text-lg">
            Test and improve your working memory with {exerciseType}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200">
            <h3 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-2">
              Today's Challenge: {currentExercise.name}
            </h3>
            <p className="text-indigo-700 dark:text-indigo-300 text-sm">
              {exerciseType === 'numbers' && 'Remember the sequence of numbers in the correct order.'}
              {exerciseType === 'shapes' && 'Memorize the pattern of shapes as they appear.'}
              {exerciseType === 'words' && 'Recall the words in the exact sequence shown.'}
              {exerciseType === 'patterns' && 'Remember the sequence of symbols and patterns.'}
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 font-bold">1</div>
              <div>
                <h3 className="font-semibold">Watch the sequence</h3>
                <p className="text-gray-600 dark:text-gray-400">Items will appear one by one. Pay close attention!</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 font-bold">2</div>
              <div>
                <h3 className="font-semibold">Recall the sequence</h3>
                <p className="text-gray-600 dark:text-gray-400">Click the items in the same order you saw them</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 font-bold">3</div>
              <div>
                <h3 className="font-semibold">Get feedback</h3>
                <p className="text-gray-600 dark:text-gray-400">See how well you remembered the sequence</p>
              </div>
            </div>
          </div>
          
          <Button onClick={startExercise} size="lg" className="w-full text-xl py-4">
            Start {currentExercise.name}
          </Button>
        </CardContent>
      </Card>
    );
  };

  const renderMemorizePhase = () => {
    const currentExercise = exerciseTypes[exerciseType];
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl flex items-center justify-center">
            <Eye className="w-5 h-5 mr-2" />
            Watch carefully!
          </CardTitle>
          <CardDescription>
            Memorize the sequence of {exerciseType}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {currentExercise.items.map((item: any, index: number) => (
              <button
                key={index}
                className={`
                  w-20 h-20 rounded-lg transition-all duration-200 border-4
                  ${currentIndex === index && showingSequence
                    ? 'border-indigo-500 shadow-lg scale-110 ' + currentExercise.className
                    : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700'
                  }
                  flex items-center justify-center
                `}
                disabled
              >
                {currentIndex === index && showingSequence ? currentExercise.getDisplay(item) : ''}
              </button>
            ))}
          </div>
          
          <div className="text-center mt-6">
            <p className="text-lg">
              Showing item {currentIndex + 1} of {sequence.length}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderRecallPhase = () => {
    const currentExercise = exerciseTypes[exerciseType];
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl flex items-center justify-center">
            <EyeOff className="w-5 h-5 mr-2" />
            Now recall the sequence!
          </CardTitle>
          <CardDescription>
            Click the {exerciseType} in the same order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {currentExercise.items.map((item: any, index: number) => (
              <button
                key={index}
                onClick={() => handleItemClick(item)}
                className={`
                  w-20 h-20 rounded-lg transition-all duration-200 border-4 border-gray-300 dark:border-gray-600
                  ${currentExercise.className}
                  hover:scale-105 hover:shadow-lg flex items-center justify-center
                `}
              >
                {currentExercise.getDisplay(item)}
              </button>
            ))}
          </div>
          
          <div className="text-center mt-6">
            <p className="text-lg">
              Selected: {userSequence.length} of {sequence.length}
            </p>
            <div className="flex justify-center space-x-2 mt-2 flex-wrap">
              {userSequence.map((item, index) => (
                <div
                  key={index}
                  className="w-10 h-10 rounded border-2 border-gray-300 flex items-center justify-center text-sm bg-gray-100 dark:bg-gray-700"
                >
                  {exerciseTypes[exerciseType].getDisplay(item)}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderFeedback = () => {
    // Calculate scoring breakdown for display
    let positionCorrect = 0;
    for (let i = 0; i < sequence.length; i++) {
      if (sequence[i] === userSequence[i]) positionCorrect++;
    }
    
    let contentCorrect = 0;
    const sequenceCopy = [...sequence];
    const userSeqCopy = [...userSequence];
    
    for (let i = 0; i < userSeqCopy.length; i++) {
      const itemIndex = sequenceCopy.indexOf(userSeqCopy[i]);
      if (itemIndex !== -1) {
        contentCorrect++;
        sequenceCopy.splice(itemIndex, 1);
      }
    }

    const currentExercise = exerciseTypes[exerciseType];

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {score >= 80 ? 'Excellent!' : score >= 60 ? 'Good job!' : 'Nice try!'}
          </CardTitle>
          <CardDescription className="text-lg">
            Your {currentExercise.name} performance
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
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center border border-green-200">
              <div className="text-2xl font-bold text-green-600">{positionCorrect}/{sequence.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Perfect Position</div>
              <div className="text-xs text-gray-500">Right item, right order</div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{contentCorrect}/{sequence.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Items Remembered</div>
              <div className="text-xs text-gray-500">Right items selected</div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Sequence Comparison:</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium w-16">Correct:</span>
                <div className="flex space-x-1 flex-wrap">
                  {sequence.map((item, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-xs bg-gray-100 dark:bg-gray-700"
                    >
                      {currentExercise.getDisplay(item)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium w-16">Your try:</span>
                <div className="flex space-x-1 flex-wrap">
                  {userSequence.map((item, index) => {
                    const isCorrect = sequence[index] === item;
                    return (
                      <div
                        key={index}
                        className={`
                          w-8 h-8 rounded border-2 flex items-center justify-center text-xs bg-gray-100 dark:bg-gray-700
                          ${isCorrect ? 'border-green-500' : 'border-red-500'}
                        `}
                      >
                        {currentExercise.getDisplay(item)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Smart Scoring:</h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Your score combines position accuracy (70%) and content memory (30%).
              Even if you get the order mixed up, you still get credit for remembering the right {exerciseType}!
            </p>
          </div>
          
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>Moving to next exercise in 3 seconds...</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  switch (phase) {
    case 'instructions':
      return renderInstructions();
    case 'memorize':
      return renderMemorizePhase();
    case 'recall':
      return renderRecallPhase();
    case 'feedback':
      return renderFeedback();
    default:
      return null;
  }
};

export default MemoryExercise;