import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListOrdered, CheckCircle, ArrowUp, ArrowDown } from "lucide-react";

interface SequencingExerciseProps {
  onComplete: (result: any) => void;
  mood: string;
  userPreferences: any;
}

const SequencingExercise = ({ onComplete, mood, userPreferences }: SequencingExerciseProps) => {
  const [phase, setPhase] = useState<'instructions' | 'playing' | 'feedback'>('instructions');
  const [currentTask, setCurrentTask] = useState(0);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [availableSteps, setAvailableSteps] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [tasks, setTasks] = useState<any[]>([]);

  // Real-world sequencing tasks
  const allTasks = [
    {
      id: 'morning-routine',
      title: 'Morning Routine',
      description: 'Arrange the steps for a healthy morning routine',
      correctSequence: [
        'Wake up and stretch',
        'Brush teeth',
        'Take shower',
        'Get dressed',
        'Eat breakfast',
        'Take morning medication'
      ],
      difficulty: 1,
      category: 'daily-living'
    },
    {
      id: 'making-coffee',
      title: 'Making Coffee',
      description: 'Put the coffee-making steps in the right order',
      correctSequence: [
        'Fill kettle with water',
        'Turn on kettle to boil',
        'Get coffee mug',
        'Add coffee to mug',
        'Pour hot water into mug',
        'Stir and enjoy'
      ],
      difficulty: 1,
      category: 'kitchen-tasks'
    },
    {
      id: 'grocery-shopping',
      title: 'Grocery Shopping',
      description: 'Organize the grocery shopping process',
      correctSequence: [
        'Make shopping list',
        'Get wallet and bags',
        'Drive to store',
        'Get shopping cart',
        'Shop for items on list',
        'Pay at checkout',
        'Load groceries in car',
        'Put groceries away at home'
      ],
      difficulty: 2,
      category: 'errands'
    },
    {
      id: 'taking-medication',
      title: 'Taking Daily Medication',
      description: 'Arrange the safe medication routine',
      correctSequence: [
        'Check medication schedule',
        'Wash hands',
        'Get pill organizer',
        'Take correct pills',
        'Drink water with pills',
        'Mark medication as taken'
      ],
      difficulty: 2,
      category: 'health-care'
    },
    {
      id: 'phone-conversation',
      title: 'Making a Phone Call',
      description: 'Order the steps for a successful phone conversation',
      correctSequence: [
        'Think about what to discuss',
        'Find contact information',
        'Dial the number',
        'Greet the person',
        'Have the conversation',
        'Say goodbye politely',
        'Hang up the phone'
      ],
      difficulty: 2,
      category: 'communication'
    },
    {
      id: 'preparing-meal',
      title: 'Preparing a Simple Meal',
      description: 'Sequence the steps for cooking safely',
      correctSequence: [
        'Wash hands',
        'Gather ingredients',
        'Get cooking utensils',
        'Prepare ingredients',
        'Cook the meal',
        'Plate the food',
        'Clean up kitchen'
      ],
      difficulty: 3,
      category: 'kitchen-tasks'
    }
  ];

  // Adjust difficulty based on mood and experience
  const getDifficulty = () => {
    let maxDifficulty = 2;
    let taskCount = 2;
    
    if (mood === 'motivated') {
      maxDifficulty = 3;
      taskCount = 3;
    } else if (mood === 'foggy' || mood === 'tired') {
      maxDifficulty = 1;
      taskCount = 1;
    } else if (mood === 'stressed') {
      maxDifficulty = 1;
      taskCount = 1;
    }
    
    if (userPreferences.experience === 'experienced') {
      maxDifficulty = 3;
      taskCount += 1;
    } else if (userPreferences.experience === 'beginner') {
      maxDifficulty = Math.min(maxDifficulty, 2);
    }
    
    return { maxDifficulty, taskCount: Math.max(1, taskCount) };
  };

  useEffect(() => {
    if (phase === 'playing') {
      generateTasks();
    }
  }, [phase]);

  const generateTasks = () => {
    const { maxDifficulty, taskCount } = getDifficulty();
    const filteredTasks = allTasks.filter(t => t.difficulty <= maxDifficulty);
    
    // Shuffle and select tasks
    const shuffled = [...filteredTasks].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(taskCount, shuffled.length));
    
    setTasks(selected);
    if (selected.length > 0) {
      initializeTask(selected[0]);
    }
  };

  const initializeTask = (task: any) => {
    // Shuffle the correct sequence for user to arrange
    const shuffled = [...task.correctSequence].sort(() => Math.random() - 0.5);
    setAvailableSteps(shuffled);
    setUserSequence([]);
  };

  const moveStep = (step: string, direction: 'up' | 'down') => {
    const currentIndex = userSequence.indexOf(step);
    if (currentIndex === -1) return;
    
    const newSequence = [...userSequence];
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex >= 0 && newIndex < newSequence.length) {
      [newSequence[currentIndex], newSequence[newIndex]] = [newSequence[newIndex], newSequence[currentIndex]];
      setUserSequence(newSequence);
    }
  };

  const addStepToSequence = (step: string) => {
    setUserSequence(prev => [...prev, step]);
    setAvailableSteps(prev => prev.filter(s => s !== step));
  };

  const removeStepFromSequence = (step: string) => {
    setUserSequence(prev => prev.filter(s => s !== step));
    setAvailableSteps(prev => [...prev, step]);
  };

  const submitSequence = () => {
    const task = tasks[currentTask];
    const correct = userSequence.every((step, index) => step === task.correctSequence[index]);
    const partialScore = userSequence.reduce((score, step, index) => {
      return score + (step === task.correctSequence[index] ? 1 : 0);
    }, 0);
    
    const taskScore = (partialScore / task.correctSequence.length) * 100;
    
    if (currentTask < tasks.length - 1) {
      setCurrentTask(currentTask + 1);
      initializeTask(tasks[currentTask + 1]);
    } else {
      calculateFinalScore();
    }
  };

  const calculateFinalScore = () => {
    // Calculate average score across all tasks
    const totalScore = 75; // Placeholder - would calculate from actual performance
    setScore(totalScore);
    setPhase('feedback');
    
    setTimeout(() => {
      const result = {
        exerciseId: 'sequencing',
        score: totalScore,
        timeSpent: Math.round((Date.now() - startTime) / 1000),
        tasksCompleted: tasks.length,
        category: 'executive-function'
      };
      onComplete(result);
    }, 3000);
  };

  const startExercise = () => {
    setPhase('playing');
  };

  const renderInstructions = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex items-center justify-center">
          <ListOrdered className="w-6 h-6 mr-2 text-indigo-600" />
          Task Sequencing
        </CardTitle>
        <CardDescription className="text-lg">
          Practice organizing everyday activities in the right order
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {getDifficulty().taskCount} real-world tasks
          </Badge>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Why This Helps:</h3>
          <p className="text-blue-700 dark:text-blue-300">
            Sequencing exercises strengthen executive function and help with planning daily activities. 
            This builds confidence for independent living.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 font-bold">1</div>
            <div>
              <h3 className="font-semibold">Drag and arrange</h3>
              <p className="text-gray-600 dark:text-gray-400">Move steps from the available list to create the correct sequence</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 font-bold">2</div>
            <div>
              <h3 className="font-semibold">Think practically</h3>
              <p className="text-gray-600 dark:text-gray-400">Consider what makes sense in real life - safety and efficiency matter</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 font-bold">3</div>
            <div>
              <h3 className="font-semibold">Build confidence</h3>
              <p className="text-gray-600 dark:text-gray-400">These skills transfer directly to your daily routine</p>
            </div>
          </div>
        </div>
        
        <Button onClick={startExercise} size="lg" className="w-full text-xl py-4">
          Start Task Sequencing
        </Button>
      </CardContent>
    </Card>
  );

  const renderGame = () => {
    const task = tasks[currentTask];
    if (!task) return null;

    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">
              Task {currentTask + 1} of {tasks.length}: {task.title}
            </CardTitle>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {task.category.replace('-', ' ')}
            </Badge>
          </div>
          <CardDescription className="text-lg">
            {task.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Available Steps */}
            <div>
              <h3 className="font-semibold mb-3 text-lg">Available Steps:</h3>
              <div className="space-y-2 min-h-[200px] p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {availableSteps.map((step, index) => (
                  <div
                    key={index}
                    onClick={() => addStepToSequence(step)}
                    className="p-3 bg-white dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 border-2 border-transparent hover:border-blue-200 transition-all"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* User Sequence */}
            <div>
              <h3 className="font-semibold mb-3 text-lg">Your Sequence:</h3>
              <div className="space-y-2 min-h-[200px] p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                {userSequence.map((step, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white dark:bg-gray-700 rounded-lg border-2 border-green-200 flex items-center justify-between"
                  >
                    <span className="flex items-center">
                      <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {index + 1}
                      </span>
                      {step}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveStep(step, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveStep(step, 'down')}
                        disabled={index === userSequence.length - 1}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeStepFromSequence(step)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                {userSequence.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    Click on steps from the left to build your sequence
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={submitSequence}
              disabled={userSequence.length !== task.correctSequence.length}
              size="lg"
              className="text-xl px-8 py-4"
            >
              {currentTask < tasks.length - 1 ? 'Next Task' : 'Complete Exercise'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderFeedback = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {score >= 80 ? 'Excellent Organization!' : score >= 60 ? 'Good Sequencing!' : 'Keep Practicing!'}
        </CardTitle>
        <CardDescription className="text-lg">
          Your executive function and planning skills
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
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200">
          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Real-World Benefits:
          </h3>
          <ul className="text-green-700 dark:text-green-300 space-y-1">
            <li>• Better planning for daily activities</li>
            <li>• Increased confidence in task completion</li>
            <li>• Improved executive function skills</li>
            <li>• Enhanced independence in daily living</li>
          </ul>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            {score >= 80 
              ? "Your sequencing skills are excellent! You show strong executive function and practical thinking." 
              : score >= 60 
                ? "Good organizational abilities. Regular practice will help you feel more confident with daily tasks." 
                : "Sequencing exercises help build the planning skills needed for independent living. Keep practicing!"}
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

export default SequencingExercise;