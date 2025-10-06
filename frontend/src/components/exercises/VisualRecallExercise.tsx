import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Grid3X3, Eye, EyeOff } from "lucide-react";

interface VisualRecallExerciseProps {
  onComplete: (result: any) => void;
  mood: string;
  userPreferences: any;
}

const VisualRecallExercise = ({ onComplete, mood, userPreferences }: VisualRecallExerciseProps) => {
  const [phase, setPhase] = useState<'instructions' | 'memorize' | 'recall' | 'feedback'>('instructions');
  const [gridSize, setGridSize] = useState(0);
  const [highlightedCells, setHighlightedCells] = useState<number[]>([]);
  const [userSelections, setUserSelections] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [showingHighlights, setShowingHighlights] = useState(false);
  const [memorizeDuration, setMemorizeDuration] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Adjust difficulty based on the 'difficulty' prop
  const getDifficultySettings = (difficulty: number) => {
    let size = 3; // 3x3 grid
    let count = 4; // 4 cells to highlight
    let duration = 3; // seconds to memorize

    if (difficulty >= 2.5) {
      size = 5; count = 8; duration = 5;
    } else if (difficulty >= 1.5) {
      size = 4; count = 6; duration = 4;
    } else { // difficulty < 1.5
      size = 3; count = 4; duration = 3;
    }
    
    // Further adjust based on mood for a gentler experience if needed
    if (mood === 'foggy' || mood === 'tired' || mood === 'stressed') {
      size = Math.max(3, size - 1);
      count = Math.max(3, count - 2);
      duration = Math.max(2, duration - 1);
    }

    return { size, count, duration };
  };

  useEffect(() => {
    if (phase === 'memorize') {
      const { size, count, duration } = getDifficultySettings(userPreferences.difficulty);
      setGridSize(size);
      setMemorizeDuration(duration);
      generateHighlights(size, count);
    }
  }, [phase, userPreferences.difficulty, mood]);

  useEffect(() => {
    if (showingHighlights && memorizeDuration > 0) {
      timeoutRef.current = setTimeout(() => {
        setShowingHighlights(false);
        setPhase('recall');
      }, memorizeDuration * 1000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [showingHighlights, memorizeDuration]);

  const generateHighlights = (size: number, count: number) => {
    const totalCells = size * size;
    const cells = Array.from({ length: totalCells }, (_, i) => i);
    const shuffled = cells.sort(() => Math.random() - 0.5);
    setHighlightedCells(shuffled.slice(0, count));
    setShowingHighlights(true);
  };

  const handleCellClick = (cellIndex: number) => {
    if (phase !== 'recall') return;

    setUserSelections(prev => {
      if (prev.includes(cellIndex)) {
        return prev.filter(i => i !== cellIndex);
      } else {
        return [...prev, cellIndex];
      }
    });
  };

  const submitRecall = () => {
    console.log("--- VisualRecallExercise Submit Debug ---");
    console.log("Highlighted Cells (Correct Pattern):", highlightedCells);
    console.log("User Selections:", userSelections);

    let correctCount = 0;
    highlightedCells.forEach(cell => {
      if (userSelections.includes(cell)) {
        correctCount++;
      }
    });

    const incorrectSelections = userSelections.filter(cell => !highlightedCells.includes(cell)).length;
    const missedHighlights = highlightedCells.filter(cell => !userSelections.includes(cell)).length;
    const totalHighlights = highlightedCells.length;
    const totalGridCells = gridSize * gridSize;

    console.log("Correct Recalls (targets found):", correctCount);
    console.log("Missed Highlights (targets not found):", missedHighlights);
    console.log("Incorrect Clicks (non-targets clicked):", incorrectSelections);
    console.log("Total Highlights (targets):", totalHighlights);
    console.log("Total Grid Cells:", totalGridCells);

    let scoreFromCorrect = 0;
    if (totalHighlights > 0) {
      scoreFromCorrect = (correctCount / totalHighlights) * 100;
    }

    const penaltyFromIncorrect = (incorrectSelections / totalGridCells) * 100;
    const finalScore = Math.max(0, scoreFromCorrect - penaltyFromIncorrect);

    console.log("Score from Correct Recalls:", scoreFromCorrect);
    console.log("Penalty from Incorrect Clicks:", penaltyFromIncorrect);
    console.log("Final Score:", finalScore);
    console.log("---------------------------------------");

    setScore(finalScore);
    setPhase('feedback');

    setTimeout(() => {
      const result = {
        exerciseId: 'visual-recall',
        score: finalScore,
        timeSpent: Math.round((Date.now() - startTime) / 1000),
        correctRecalls: correctCount,
        totalHighlights: highlightedCells.length,
        difficulty: userPreferences.difficulty
      };
      onComplete(result);
    }, 3000);
  };

  const startExercise = () => {
    setPhase('instructions'); // Start from instructions to ensure fresh state
  };

  const renderInstructions = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex items-center justify-center">
          <Grid3X3 className="w-6 h-6 mr-2 text-indigo-600" />
          Visual Recall
        </CardTitle>
        <CardDescription className="text-lg">
          Memorize and recall the positions of highlighted cells
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 font-bold">1</div>
            <div>
              <h3 className="font-semibold">Watch the grid</h3>
              <p className="text-gray-600 dark:text-gray-400">A few cells will light up briefly. Pay close attention to their positions!</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 font-bold">2</div>
            <div>
              <h3 className="font-semibold">Recall the pattern</h3>
              <p className="text-gray-600 dark:text-gray-400">After they disappear, click on the cells you remember were highlighted.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 font-bold">3</div>
            <div>
              <h3 className="font-semibold">Accuracy matters</h3>
              <p className="text-gray-600 dark:text-gray-400">Try to select only the correct cells. Incorrect clicks will reduce your score.</p>
            </div>
          </div>
        </div>
        
        <Button onClick={() => setPhase('memorize')} size="lg" className="w-full text-xl py-4">
          Start Visual Recall
        </Button>
      </CardContent>
    </Card>
  );

  const renderGrid = (interactive: boolean) => {
    const cells = Array.from({ length: gridSize * gridSize }, (_, i) => i);
    const { size } = getDifficultySettings(userPreferences.difficulty);

    return (
      <div
        className="grid gap-1 mx-auto"
        style={{
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          width: `${size * 60}px`, // Adjust grid width based on size
          height: `${size * 60}px` // Adjust grid height based on size
        }}
      >
        {cells.map(cellIndex => (
          <div
            key={cellIndex}
            className={`
              w-14 h-14 rounded-md flex items-center justify-center text-white font-bold text-lg
              transition-all duration-300
              ${showingHighlights && highlightedCells.includes(cellIndex) ? 'bg-blue-500 scale-110 shadow-lg' : 'bg-gray-200 dark:bg-gray-700'}
              ${interactive && userSelections.includes(cellIndex) ? 'bg-green-500' : ''}
              ${interactive ? 'cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600' : ''}
            `}
            onClick={interactive ? () => handleCellClick(cellIndex) : undefined}
          >
            {/* Optional: show cell index for debugging */}
            {/* {cellIndex} */}
          </div>
        ))}
      </div>
    );
  };

  const renderMemorizePhase = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl flex items-center justify-center">
          <Eye className="w-5 h-5 mr-2" />
          Watch carefully!
        </CardTitle>
        <CardDescription>
          Memorize the highlighted cells. They will disappear in {memorizeDuration} seconds.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderGrid(false)}
        <div className="text-center mt-6">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {showingHighlights ? 'Memorizing...' : 'Get ready to recall!'}
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
          Recall the pattern!
        </CardTitle>
        <CardDescription>
          Click on the cells you remember were highlighted.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderGrid(true)}
        <div className="text-center mt-6">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Selected: {userSelections.length}
          </p>
          <Button
            onClick={submitRecall}
            disabled={userSelections.length === 0}
            size="lg"
            className="w-full text-xl py-4 mt-4"
          >
            Submit Recall
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderFeedback = () => {
    const { count } = getDifficultySettings(userPreferences.difficulty);
    const correctRecalls = userSelections.filter(cell => highlightedCells.includes(cell)).length;
    const missedRecalls = highlightedCells.filter(cell => !userSelections.includes(cell)).length;
    const incorrectClicks = userSelections.filter(cell => !highlightedCells.includes(cell)).length;

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {score >= 80 ? 'Excellent Visual Memory!' : score >= 60 ? 'Good Recall!' : 'Keep Practicing!'}
          </CardTitle>
          <CardDescription className="text-lg">
            You recalled {correctRecalls} out of {count} cells
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
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{correctRecalls}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{missedRecalls}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Missed</div>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">{incorrectClicks}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Incorrect Clicks</div>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              {score >= 80 
                ? "Your visual memory is sharp! You accurately recalled the pattern." 
                : score >= 60 
                  ? "Good visual recall. Practice helps improve pattern recognition and memory." 
                  : "Visual memory exercises strengthen your ability to remember spatial information. Keep practicing!"}
            </h3>
          </div>
          
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>Session complete! Returning to dashboard...</p>
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

export default VisualRecallExercise;