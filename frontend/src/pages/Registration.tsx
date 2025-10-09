import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Brain, ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { showSuccess } from "@/utils/toast";
import ScrollIndicator from "@/components/ui/scroll-indicator";

const Registration = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    // Load temporary registration data
    const tempData = localStorage.getItem('mindbloom-registration-temp');
    if (tempData) {
      const registrationData = JSON.parse(tempData);
      setFormData(prev => ({
        ...prev,
        name: registrationData.name,
        email: registrationData.email
      }));
    } else {
      // If no temp data, redirect to auth
      navigate('/auth');
    }
  }, [navigate]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    displayName: '',
    ageGroup: '',
    cognitiveConditions: [] as string[],
    otherCondition: '',
    cognitiveAreas: [] as string[],
    reminderTime: '',
    startToday: ''
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === totalSteps) {
      completeRegistration();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeRegistration = () => {
    // Create user data
    const userData = {
      ...formData,
      onboardingCompleted: true,
      joinDate: new Date().toISOString(),
      streak: 0,
      totalSessions: 0,
      lastSessionDate: null,
      lastSessionScore: null,
      lastSessionDuration: null,
      exerciseHistory: [],
      exerciseStats: {},
      goals: ['prevention'], // Default goal
      cognitiveAreas: ['memory', 'attention'], // Default areas
      experience: 'beginner' // Default experience
    };
    
    // Save to both session and persistent storage
    localStorage.setItem('mindbloom-user', JSON.stringify(userData));
    const userProfileKey = `mindbloom-profile-${formData.email.toLowerCase()}`;
    localStorage.setItem(userProfileKey, JSON.stringify(userData));
    
    // Clean up temporary registration data
    localStorage.removeItem('mindbloom-registration-temp');
    
    showSuccess("Welcome to MindBloom! Your account has been created.");
    
    // Navigate based on user choice
    if (formData.startToday === 'yes') {
      navigate('/dashboard');
    } else {
      navigate('/see-you-tomorrow');
    }
  };

  const updateFormData = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCondition = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      cognitiveConditions: prev.cognitiveConditions.includes(condition) 
        ? prev.cognitiveConditions.filter(c => c !== condition)
        : [...prev.cognitiveConditions, condition]
    }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.displayName.trim() && formData.ageGroup;
      case 2:
        return true; // Optional step
      case 3:
        return formData.reminderTime;
      case 4:
        return formData.startToday;
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
              <CardTitle className="text-2xl">Welcome to MindBloom!</CardTitle>
              <CardDescription className="text-lg">
                Let's get started with some basic information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-lg">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  readOnly
                  disabled
                  className="text-lg p-4 bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-lg">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  disabled
                  className="text-lg p-4 bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-lg">Display Name</Label>
                <Input
                  id="displayName"
                  placeholder="How would you like to be addressed?"
                  value={formData.displayName}
                  onChange={(e) => updateFormData('displayName', e.target.value)}
                  className="text-lg p-4"
                />
                <p className="text-sm text-gray-500">This is how we'll greet you throughout the app</p>
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
              <CardTitle className="text-2xl">Baseline Cognitive Health (Optional)</CardTitle>
              <CardDescription className="text-lg">
                This helps us personalize your experience. You can skip this step if you prefer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200">
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  This information is completely private and helps us provide better support for your cognitive wellness journey.
                </p>
              </div>

              {[
                { id: 'none', label: 'No specific conditions', desc: 'General brain health and prevention' },
                { id: 'mild-memory', label: 'Mild memory concerns', desc: 'Occasional forgetfulness or memory lapses' },
                { id: 'post-surgery', label: 'Post-surgery recovery', desc: 'Recovering cognitive function after medical procedure' },
                { id: 'tbi', label: 'Traumatic brain injury (TBI)', desc: 'Recovery from head injury or concussion' },
                { id: 'stroke', label: 'Post-stroke', desc: 'Cognitive rehabilitation after stroke' },
                { id: 'mci', label: 'Mild cognitive impairment (MCI)', desc: 'Diagnosed mild cognitive changes' },
                { id: 'early-dementia', label: 'Early-stage dementia', desc: 'Early dementia diagnosis with family/caregiver support' },
                { id: 'other', label: 'Other condition', desc: 'Please specify below' }
              ].map((condition) => (
                <div key={condition.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                     onClick={() => toggleCondition(condition.id)}>
                  <Checkbox 
                    id={condition.id}
                    checked={formData.cognitiveConditions.includes(condition.id)}
                    onChange={() => toggleCondition(condition.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor={condition.id} className="text-lg font-medium cursor-pointer">
                      {condition.label}
                    </Label>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{condition.desc}</p>
                  </div>
                </div>
              ))}

              {formData.cognitiveConditions.includes('other') && (
                <div className="space-y-2">
                  <Label htmlFor="otherCondition" className="text-lg">Please specify:</Label>
                  <Textarea
                    id="otherCondition"
                    placeholder="Describe your condition or situation..."
                    value={formData.otherCondition}
                    onChange={(e) => updateFormData('otherCondition', e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Reminder Preferences</CardTitle>
              <CardDescription className="text-lg">
                When would you like gentle reminders for your daily brain training?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup 
                value={formData.reminderTime} 
                onValueChange={(value) => updateFormData('reminderTime', value)}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="morning" id="time-morning" />
                  <Label htmlFor="time-morning" className="text-lg cursor-pointer flex-1">
                    Morning (8-11 AM) - Start the day with mental exercise
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
                  <RadioGroupItem value="no-reminders" id="time-none" />
                  <Label htmlFor="time-none" className="text-lg cursor-pointer flex-1">
                    No reminders - I'll train when it's convenient
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-green-600">Thank You for Registering! 🎉</CardTitle>
              <CardDescription className="text-lg">
                Welcome to the MindBloom community! Your cognitive wellness journey begins now.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 text-center">
                <p className="text-green-700 dark:text-green-300 text-lg mb-4">
                  🧠 Your account has been successfully created!
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you ready to start your brain training journey?
                </p>
              </div>

              <RadioGroup
                value={formData.startToday}
                onValueChange={(value) => updateFormData('startToday', value)}
                className="space-y-4"
              >
                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="yes" id="start-yes" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="start-yes" className="text-lg font-medium cursor-pointer">
                      Yes, let's start today! 🚀
                    </Label>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      I'm ready to begin my brain training journey right now
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="no" id="start-no" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="start-no" className="text-lg font-medium cursor-pointer">
                      I'll start tomorrow 📅
                    </Label>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Set up my account today, begin training tomorrow
                    </p>
                  </div>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MindBloom Registration</h1>
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
            {currentStep === totalSteps ? 'Complete Registration' : 'Next'}
            {currentStep < totalSteps && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Registration;