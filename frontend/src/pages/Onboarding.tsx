import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { showSuccess } from "@/utils/toast";
import ScrollIndicator from "@/components/ui/scroll-indicator";

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    ageGroup: '',
    workoutGoals: [] as string[],
    goals: [] as string[],
    cognitiveAreas: [] as string[],
    experience: '',
    timePreference: ''
  });

  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding - update existing user data instead of overwriting
      const existingUserData = localStorage.getItem('mindbloom-user');
      if (existingUserData) {
        const userData = JSON.parse(existingUserData);
        const updatedUserData = {
          ...userData,
          ...formData,
          onboardingCompleted: true,
          joinDate: userData.joinDate || new Date().toISOString(),
          streak: userData.streak || 0,
          totalSessions: userData.totalSessions || 0
        };
        localStorage.setItem('mindbloom-user', JSON.stringify(updatedUserData));
      } else {
        // Fallback if no existing user data
        const userData = {
          ...formData,
          onboardingCompleted: true,
          joinDate: new Date().toISOString(),
          streak: 0,
          totalSessions: 0
        };
        localStorage.setItem('mindbloom-user', JSON.stringify(userData));
      }
      showSuccess("Welcome to MindBloom! Your personalized journey begins now.");
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'workoutGoals' | 'goals' | 'cognitiveAreas', item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() && formData.email.trim() && formData.ageGroup;
      case 2:
        return formData.workoutGoals.length > 0;
      case 3:
        return formData.goals.length > 0;
      case 4:
        return formData.cognitiveAreas.length > 0;
      case 5:
        return formData.experience;
      case 6:
        return formData.timePreference;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome to MindBloom</CardTitle>
              <CardDescription className="text-lg">
                Let's get to know you better to personalize your cognitive training
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-lg">What should we call you?</Label>
                <Input
                  id="name"
                  placeholder="Your first name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="text-lg p-4"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-lg">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className="text-lg p-4"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-lg">Age group</Label>
                <RadioGroup 
                  value={formData.ageGroup} 
                  onValueChange={(value) => updateFormData('ageGroup', value)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="40-49" id="age-40-49" className="w-5 h-5" />
                    <Label htmlFor="age-40-49" className="text-lg cursor-pointer">40-49 years</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="50-59" id="age-50-59" className="w-5 h-5" />
                    <Label htmlFor="age-50-59" className="text-lg cursor-pointer">50-59 years</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="60-69" id="age-60-69" className="w-5 h-5" />
                    <Label htmlFor="age-60-69" className="text-lg cursor-pointer">60-69 years</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="70+" id="age-70+" className="w-5 h-5" />
                    <Label htmlFor="age-70+" className="text-lg cursor-pointer">70+ years</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-indigo-600">Workout Goals</CardTitle>
              <CardDescription className="text-lg">
                Select all that apply to help us personalize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: 'prevent', label: 'Prevent cognitive decline', desc: 'Stay mentally sharp as I age' },
                { id: 'recovery', label: 'Cognitive recovery', desc: 'Recover from injury, surgery, or trauma' },
                { id: 'focus', label: 'Improve focus & concentration', desc: 'Better attention and mental clarity' },
                { id: 'memory', label: 'Enhance memory', desc: 'Remember names, dates, and details better' },
                { id: 'stress', label: 'Manage stress & brain fog', desc: 'Reduce mental fatigue and overwhelm' },
                { id: 'professional', label: 'Maintain professional edge', desc: 'Stay sharp for demanding work' }
              ].map((goal) => (
                <div key={goal.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                     onClick={() => toggleArrayItem('workoutGoals', goal.id)}>
                  <Checkbox
                    id={goal.id}
                    checked={formData.workoutGoals.includes(goal.id)}
                    onChange={() => toggleArrayItem('workoutGoals', goal.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor={goal.id} className="text-lg font-medium cursor-pointer">
                      {goal.label}
                    </Label>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{goal.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">What are your goals?</CardTitle>
              <CardDescription className="text-lg">
                Select all that apply to help us personalize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: 'prevention', label: 'Prevent cognitive decline', desc: 'Stay mentally sharp as I age' },
                { id: 'recovery', label: 'Cognitive recovery', desc: 'Recover from injury, surgery, or trauma' },
                { id: 'focus', label: 'Improve focus & concentration', desc: 'Better attention and mental clarity' },
                { id: 'memory', label: 'Enhance memory', desc: 'Remember names, dates, and details better' },
                { id: 'stress', label: 'Manage stress & brain fog', desc: 'Reduce mental fatigue and overwhelm' },
                { id: 'professional', label: 'Maintain professional edge', desc: 'Stay sharp for demanding work' }
              ].map((goal) => (
                <div key={goal.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                     onClick={() => toggleArrayItem('goals', goal.id)}>
                  <Checkbox
                    id={goal.id}
                    checked={formData.goals.includes(goal.id)}
                    onChange={() => toggleArrayItem('goals', goal.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor={goal.id} className="text-lg font-medium cursor-pointer">
                      {goal.label}
                    </Label>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{goal.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Which areas would you like to focus on?</CardTitle>
              <CardDescription className="text-lg">
                Choose the cognitive skills most important to you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: 'attention', label: 'Attention & Focus', desc: 'Sustained concentration and selective attention' },
                { id: 'memory', label: 'Memory', desc: 'Working memory, recall, and retention' },
                { id: 'language', label: 'Language', desc: 'Word finding, comprehension, and communication' },
                { id: 'executive', label: 'Executive Function', desc: 'Planning, problem-solving, and decision-making' },
                { id: 'processing', label: 'Processing Speed', desc: 'Quick thinking and mental agility' },
                { id: 'spatial', label: 'Spatial Reasoning', desc: 'Visual-spatial skills and navigation' },
                { id: 'creativity', label: 'Creativity', desc: 'Creative thinking and mental flexibility' }
              ].map((area) => (
                <div key={area.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                     onClick={() => toggleArrayItem('cognitiveAreas', area.id)}>
                  <Checkbox
                    id={area.id}
                    checked={formData.cognitiveAreas.includes(area.id)}
                    onChange={() => toggleArrayItem('cognitiveAreas', area.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor={area.id} className="text-lg font-medium cursor-pointer">
                      {area.label}
                    </Label>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{area.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Previous experience</CardTitle>
              <CardDescription className="text-lg">
                This helps us set the right starting difficulty
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup 
                value={formData.experience} 
                onValueChange={(value) => updateFormData('experience', value)}
                className="space-y-4"
              >
                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="beginner" id="exp-beginner" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="exp-beginner" className="text-lg font-medium cursor-pointer">
                      New to brain training
                    </Label>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      I haven't used cognitive training apps before
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="some" id="exp-some" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="exp-some" className="text-lg font-medium cursor-pointer">
                      Some experience
                    </Label>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      I've tried brain games or puzzles occasionally
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="experienced" id="exp-experienced" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="exp-experienced" className="text-lg font-medium cursor-pointer">
                      Experienced
                    </Label>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      I regularly do puzzles, brain games, or cognitive exercises
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">When do you prefer to train?</CardTitle>
              <CardDescription className="text-lg">
                We'll send gentle reminders at your preferred time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={formData.timePreference}
                onValueChange={(value) => updateFormData('timePreference', value)}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="morning" id="time-morning" />
                  <Label htmlFor="time-morning" className="text-lg cursor-pointer flex-1">
                    Morning (7-11 AM) - Start the day with mental exercise
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="afternoon" id="time-afternoon" />
                  <Label htmlFor="time-afternoon" className="text-lg cursor-pointer flex-1">
                    Afternoon (12-5 PM) - Midday mental break
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="evening" id="time-evening" />
                  <Label htmlFor="time-evening" className="text-lg cursor-pointer flex-1">
                    Evening (6-9 PM) - Wind down with brain training
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="flexible" id="time-flexible" />
                  <Label htmlFor="time-flexible" className="text-lg cursor-pointer flex-1">
                    Flexible - I'll train when it's convenient
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      {/* Header */}
      <header className="container mx-auto px-4 mb-8">
        <div className="flex items-center justify-center space-x-2">
          <Brain className="h-8 w-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MindBloom</h1>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="container mx-auto px-4 mb-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {Math.round((currentStep / totalSteps) * 100)}% complete
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
        <ScrollIndicator />
      </div>

      {/* Step Content */}
      <div className="container mx-auto px-4">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="container mx-auto px-4 mt-8">
        <div className="max-w-2xl mx-auto flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="text-lg px-6 py-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="text-lg px-6 py-3 bg-indigo-600 hover:bg-indigo-700"
          >
            {currentStep === totalSteps ? 'Complete Setup' : 'Next'}
            {currentStep < totalSteps && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;