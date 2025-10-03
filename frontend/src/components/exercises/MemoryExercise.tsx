import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Eye, EyeOff } from "lucide-react";

interface MemoryExerciseProps {
  onComplete: (result: any) => void;
  mood: string;
  userPreferences: any;
}

const MemoryExercise = ({ onComplete, mood, userPreferences }: MemoryExerciseProps) => {
  const [phase, setPhase] = useState<'instructions' | 'memorize' | 'recall' | 'feedback'>('instructions');
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [showingSequence, setShowingSequence] = useState(false);

  // Adjust difficulty based on mood and experience
  const getDifficulty = () => {
    let baseLength = 4;
    
    if (mood === 'motivated') baseLength = 6;
    else if (mood === 'foggy' || mood === 'tired') baseLength = 3;
    else if (mood === 'stressed') baseLength = 3;
    
    if (userPreferences.experience === 'experienced') baseLength += 1;
    else if (userPreferences.experience === 'beginner') baseLength -= 1;
    
    return Math.max(3, Math.min(8, baseLength));
  };

  const colors = [
    { id: 1, name: 'Red', bg: 'bg-red-500', hover: 'hover:bg-red-600' },
    { id: 2, name: 'Blue', bg: 'bg-blue-500', hover: 'hover:bg-blue-600' },
    { id: 3, name: 'Green', bg: 'bg-green-500', hover: 'hover:bg-green-600' },
    { id: 4, name: 'Yellow', bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600' },
    { id: 5, name: 'Purple', bg: 'bg-purple-500', hover: 'hover:bg-purple-600' },
    { id: 6, name: 'Orange', bg: 'bg-orange-500', hover: 'hover:bg-orange-600' },
    { id: 7, name: 'Pink', bg: 'bg-pink-500', hover: 'hover:bg-pink-600' },
    { id: 8, name: 'Teal', bg: 'bg-teal-500', hover: 'hover:bg-teal-600' }
  ];

  useEffect(() => {
    if (phase === 'memorize') {
      generateSequence();
    }
  }, [phase]);

  const generateSequence = () => {
    const length = getDifficulty();
    const newSequence = Array.from({ length }, () => Math.floor(Math.random() * colors.length) + 1);
    setSequence(newSequence);
    showSequence(newSequence);
  };

  const showSequence = async (seq: number[]) => {
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

  const handleColorClick = (colorId: number) => {
    if (phase !== 'recall') return;
    
    const newUserSequence = [...userSequence, colorId];
    setUserSequence(newUserSequence);
    
    if (newUserSequence.length === sequence.length) {
      calculateScore(newUserSequence);
    }
  };

  const calculateScore = (userSeq: number[]) => {
    let correct = 0;
    for (let i = 0; i < sequence.length; i++) {
      if (sequence[i] === userSeq[i]) correct++;
    }
    
    const percentage = (correct / sequence.length) * 100;
    setScore(percentage);
    setPhase('feedback');
    
    setTimeout(() => {
      const result = {
        exerciseId: 'memory',
        score: percentage,
        timeSpent: Math.round((Date.now() - startTime) / 1000),
        difficulty: sequence.length,
        correct,
        total: sequence.length
      };
      onComplete(result);
    }, 3000);
  };

  const startExercise = () => {
    setPhase('memorize');
  };

  const renderInstructions = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex items-center justify-center">
          <Brain className="w-6 h-6 mr-2 text-indigo-600" />
          Memory Challenge
        </CardTitle>
        <CardDescription className="text-lg">
          Test and improve your working memory
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 font-bold">1</div>
            
            <div>
              <h3 className="font-semibold">Watch the sequence</h3>
              <p className="text-gray-600 dark:text-gray-400">Colors will light up one by one. Pay close attention!</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 font-bold">2</div>
            <div>
              <h3 className="font-semibold">Recall the sequence</h3>
              <p className="text-gray-600 dark:text-gray-400">Click the colors in the same order you saw them</p>
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
          Start Memory Challenge
        </Button>
      </CardContent>
    </Card>
  );

  const renderMemorizePhase = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl flex items-center justify-center">
          <Eye className="w-5 h-5 mr-2" />
          Watch carefully!
        </CardTitle>
        <CardDescription>
          Memorize the sequence of colors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
          {colors.slice(0, Math.min(8, colors.length)).map((color, index) => (
            <button
              key={color.id}
              className={`
                w-16 h-16 rounded-lg transition-all duration-200 border-4
                ${color.bg} 
                ${currentIndex === index && showingSequence 
                  ? 'border-white shadow-lg scale-110' 
                  : 'border-gray-300 dark:border-gray-600'
                }
              `}
              disabled
            />
          ))}
        </div>
        
        <div className="text-center mt-6">
          <p className="text-lg">
            Showing color {currentIndex + 1} of {sequence.length}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderRecallPhase = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl flex items-center justify-center">
          <EyeOff className="w-5 h-5 mr-2" />
          Now recall the sequence!
        </CardTitle>
        <CardDescription>
          Click the colors in the same order
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
          {colors.slice(0, Math.min(8, colors.length)).map((color) => (
            <button
              key={color.id}
              onClick={() => handleColorClick(color.id)}
              className={`
                w-16 h-16 rounded-lg transition-all duration-200 border-4 border-gray-300 dark:border-gray-600
                ${color.bg} ${color.hover}
                hover:scale-105 hover:shadow-lg
              `}
            />
          ))}
        </div>
        
        <div className="text-center mt-6">
          <p className="text-lg">
            Selected: {userSequence.length} of {sequence.length}
          </p>
          <div className="flex justify-center space-x-2 mt-2">
            {userSequence.map((colorId, index) => {
              const color = colors.find(c => c.id === colorId);
              return (
                <div
                  key={index}
                  className={`w-8 h-8 rounded ${color?.bg} border-2 border-gray-300`}
                />
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderFeedback = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {score >= 80 ? 'Excellent!' : score >= 60 ? 'Good job!' : 'Nice try!'}
        </CardTitle>
        <CardDescription className="text-lg">
          You got {Math.round((score / 100) * sequence.length)} out of {sequence.length} colors correct
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
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Sequence Comparison:</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium w-16">Correct:</span>
              <div className="flex space-x-1">
                {sequence.map((colorId, index) => {
                  const color = colors.find(c => c.id === colorId);
                  return (
                    <div
                      key={index}
                      className={`w-6 h-6 rounded ${color?.bg} border border-gray-300`}
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium w-16">Your try:</span>
              <div className="flex space-x-1">
                {userSequence.map((colorId, index) => {
                  const color = colors.find(c => c.id === colorId);
                  const isCorrect = sequence[index] === colorId;
                  return (
                    <div
                      key={index}
                      className={`w-6 h-6 rounded ${color?.bg} border-2 ${
                        isCorrect ? 'border-green-500' : 'border-red-500'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
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