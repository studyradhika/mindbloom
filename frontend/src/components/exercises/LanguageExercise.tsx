import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageSquare, Check, X } from "lucide-react";

interface LanguageExerciseProps {
  onComplete: (result: any) => void;
  mood: string;
  userPreferences: any;
  exerciseId?: string;
}

const LanguageExercise = ({ onComplete, mood, userPreferences, exerciseId }: LanguageExerciseProps) => {
  const [phase, setPhase] = useState<'instructions' | 'playing' | 'feedback'>('instructions');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [questions, setQuestions] = useState<any[]>([]);

  // Word completion and association questions
  const allQuestions = [
    {
      type: 'completion',
      question: 'Complete the word: ELEPH___',
      answer: 'ant',
      hint: 'Large gray animal with a trunk',
      difficulty: 1
    },
    {
      type: 'completion',
      question: 'Complete the word: BUTTERF___',
      answer: 'ly',
      hint: 'Colorful insect that flies',
      difficulty: 1
    },
    {
      type: 'association',
      question: 'What word is associated with: Ocean, Waves, Sand',
      answer: 'beach',
      hint: 'A place where land meets water',
      difficulty: 2
    },
    {
      type: 'completion',
      question: 'Complete the word: REFRIG___',
      answer: 'erator',
      hint: 'Kitchen appliance that keeps food cold',
      difficulty: 2
    },
    {
      type: 'association',
      question: 'What word connects: Book, Library, Reading',
      answer: 'knowledge',
      hint: 'What you gain from learning',
      difficulty: 3
    },
    {
      type: 'completion',
      question: 'Complete the word: PHOTOGR___',
      answer: 'aphy',
      hint: 'Art of taking pictures',
      difficulty: 2
    },
    {
      type: 'association',
      question: 'What word relates to: Clock, Calendar, Schedule',
      answer: 'time',
      hint: 'What these all measure or organize',
      difficulty: 2
    },
    {
      type: 'completion',
      question: 'Complete the word: UMBR___',
      answer: 'ella',
      hint: 'Protects you from rain',
      difficulty: 1
    },
    {
      type: 'association',
      question: 'What connects: Stethoscope, Hospital, Medicine',
      answer: 'doctor',
      hint: 'Medical professional',
      difficulty: 2
    },
    {
      type: 'completion',
      question: 'Complete the word: TELEV___',
      answer: 'ision',
      hint: 'Device for watching shows',
      difficulty: 1
    }
  ];

  // Adjust difficulty based on mood and experience
  const getDifficulty = () => {
    let questionCount = 5;
    let maxDifficulty = 2;
    
    if (mood === 'motivated') {
      questionCount = 7;
      maxDifficulty = 3;
    } else if (mood === 'foggy' || mood === 'tired') {
      questionCount = 4;
      maxDifficulty = 1;
    } else if (mood === 'stressed') {
      questionCount = 3;
      maxDifficulty = 1;
    }
    
    if (userPreferences.experience === 'experienced') {
      questionCount += 1;
      maxDifficulty = 3;
    } else if (userPreferences.experience === 'beginner') {
      questionCount -= 1;
      maxDifficulty = Math.min(maxDifficulty, 2);
    }
    
    return { questionCount: Math.max(3, questionCount), maxDifficulty };
  };

  useEffect(() => {
    if (phase === 'playing') {
      generateQuestions();
    }
  }, [phase]);

  const generateQuestions = () => {
    const { questionCount, maxDifficulty } = getDifficulty();
    const filteredQuestions = allQuestions.filter(q => q.difficulty <= maxDifficulty);
    
    // Shuffle and select questions
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    
    setQuestions(selected);
  };

  const handleAnswerSubmit = (answer: string) => {
    const newAnswers = [...userAnswers, answer.toLowerCase().trim()];
    setUserAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore(newAnswers);
    }
  };

  const calculateScore = (answers: string[]) => {
    let correct = 0;
    
    answers.forEach((answer, index) => {
      const question = questions[index];
      if (question && answer === question.answer.toLowerCase()) {
        correct++;
      }
    });
    
    const percentage = (correct / questions.length) * 100;
    setScore(percentage);
    setPhase('feedback');
    
    setTimeout(() => {
      const result = {
        exerciseId: exerciseId || 'language',
        score: percentage,
        timeSpent: Math.round((Date.now() - startTime) / 1000),
        correct,
        total: questions.length,
        answers: answers
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
          <MessageSquare className="w-6 h-6 mr-2 text-indigo-600" />
          Word Skills
        </CardTitle>
        <CardDescription className="text-lg">
          Test your language and verbal reasoning abilities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {getDifficulty().questionCount} questions
          </Badge>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 font-bold">1</div>
            <div>
              <h3 className="font-semibold">Word Completion</h3>
              <p className="text-gray-600 dark:text-gray-400">Complete partial words by filling in the missing letters</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 font-bold">2</div>
            <div>
              <h3 className="font-semibold">Word Association</h3>
              <p className="text-gray-600 dark:text-gray-400">Find words that connect or relate to given concepts</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 font-bold">3</div>
            <div>
              <h3 className="font-semibold">Think carefully</h3>
              <p className="text-gray-600 dark:text-gray-400">Take your time to think about each answer</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Example:</h3>
          <p className="text-blue-700 dark:text-blue-300">
            Complete the word: CAR___ → Answer: "pet" (making "carpet")
          </p>
        </div>
        
        <Button onClick={startExercise} size="lg" className="w-full text-xl py-4">
          Start Word Skills
        </Button>
      </CardContent>
    </Card>
  );

  const renderGame = () => {
    const question = questions[currentQuestion];
    if (!question) return null;

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">
              Question {currentQuestion + 1} of {questions.length}
            </CardTitle>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {question.type === 'completion' ? 'Word Completion' : 'Word Association'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">{question.question}</h2>
            
            {question.hint && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 mb-4">
                <p className="text-yellow-800 dark:text-yellow-200">
                  💡 Hint: {question.hint}
                </p>
              </div>
            )}
          </div>
          
          <AnswerInput 
            onSubmit={handleAnswerSubmit}
            placeholder={question.type === 'completion' ? 'Enter the missing part' : 'Enter the connecting word'}
          />
          
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>Type your answer and press Enter or click Submit</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderFeedback = () => {
    const correctCount = userAnswers.filter((answer, index) => 
      answer === questions[index]?.answer.toLowerCase()
    ).length;

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {score >= 80 ? 'Excellent Vocabulary!' : score >= 60 ? 'Good Word Skills!' : 'Keep Building!'}
          </CardTitle>
          <CardDescription className="text-lg">
            You got {correctCount} out of {questions.length} words correct
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
          
          <div className="space-y-3">
            <h3 className="font-semibold text-center">Review Your Answers:</h3>
            {questions.map((question, index) => {
              const userAnswer = userAnswers[index];
              const isCorrect = userAnswer === question.answer.toLowerCase();
              
              return (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium mb-1">{question.question}</p>
                      <div className="flex items-center space-x-2">
                        {isCorrect ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <X className="w-5 h-5 text-red-600" />
                        )}
                        <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                          Your answer: "{userAnswer}"
                        </span>
                      </div>
                      {!isCorrect && (
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          Correct answer: "{question.answer}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              {score >= 80 
                ? "Your language skills are sharp! You show excellent word knowledge and reasoning." 
                : score >= 60 
                  ? "Good verbal abilities. Regular practice will help expand your vocabulary further." 
                  : "Language exercises help strengthen word recall and verbal reasoning. Keep practicing!"}
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
    case 'playing':
      return renderGame();
    case 'feedback':
      return renderFeedback();
    default:
      return null;
  }
};

// Answer input component
const AnswerInput = ({ onSubmit, placeholder }: { onSubmit: (answer: string) => void; placeholder: string }) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmit(answer);
      setAnswer('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <Input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="text-xl p-4 text-center"
        autoFocus
      />
      <Button 
        onClick={handleSubmit}
        disabled={!answer.trim()}
        size="lg"
        className="w-full text-xl py-4"
      >
        Submit Answer
      </Button>
    </div>
  );
};

export default LanguageExercise;