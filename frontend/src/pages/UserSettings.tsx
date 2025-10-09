import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Brain, ArrowLeft, Save, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "@/utils/toast";
import ScrollIndicator from "@/components/ui/scroll-indicator";

const UserSettings = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    ageGroup: '',
    cognitiveConditions: [] as string[],
    otherCondition: '',
    reminderTime: '',
    timePreference: '',
    goals: [] as string[],
    cognitiveAreas: [] as string[],
  });

  useEffect(() => {
    const storedData = localStorage.getItem('mindbloom-user');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setUserData(parsedData);
      setFormData({
        name: parsedData.name || '',
        displayName: parsedData.displayName || '',
        ageGroup: parsedData.ageGroup || '',
        cognitiveConditions: parsedData.cognitiveConditions || [],
        otherCondition: parsedData.otherCondition || '',
        reminderTime: parsedData.reminderTime || '',
        timePreference: parsedData.timePreference || '',
        goals: parsedData.goals || [],
        cognitiveAreas: parsedData.cognitiveAreas || [],
      });
    } else {
      navigate('/signin'); // Redirect to sign-in if not logged in
    }
  }, [navigate]);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'goals' | 'cognitiveConditions' | 'cognitiveAreas', item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item) 
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const handleSaveChanges = () => {
    if (!formData.displayName.trim() || !formData.ageGroup) {
      showError("Please fill in your display name and age group.");
      return;
    }

    const updatedUserData = {
      ...userData,
      ...formData,
      email: userData.email, // Preserve original email, never allow changes
      lastModifiedDate: new Date().toISOString(),
    };

    console.log('🔧 UserSettings: Saving user data:', updatedUserData);
    console.log('🔧 UserSettings: Previous user data:', userData);
    
    // Save to current session storage
    localStorage.setItem('mindbloom-user', JSON.stringify(updatedUserData));
    
    // Also save to persistent profile storage using email-based key
    const userProfileKey = `mindbloom-profile-${updatedUserData.email.toLowerCase()}`;
    localStorage.setItem(userProfileKey, JSON.stringify(updatedUserData));
    console.log('🔧 UserSettings: Data also saved to persistent profile:', userProfileKey);
    
    setUserData(updatedUserData); // Update local state
    
    // Verify the data was saved correctly
    const savedData = localStorage.getItem('mindbloom-user');
    const savedProfile = localStorage.getItem(userProfileKey);
    console.log('🔧 UserSettings: Data saved to localStorage:', JSON.parse(savedData || '{}'));
    console.log('🔧 UserSettings: Data saved to persistent profile:', JSON.parse(savedProfile || '{}'));
    
    showSuccess("Profile settings saved successfully!");
    navigate('/dashboard');
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Brain className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-pulse" />
            <p className="text-xl text-gray-700">Loading settings...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      {/* Header */}
      <header className="container mx-auto px-4 mb-8">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Profile Settings</h1>
          </div>
          <Button 
            onClick={handleSaveChanges}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Manage Your Profile</CardTitle>
            <CardDescription className="text-lg">
              Update your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4 border-b pb-6">
              <h2 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400">Basic Information</h2>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-lg">Username</Label>
                <Input
                  id="name"
                  placeholder="Username"
                  value={formData.name}
                  readOnly
                  disabled
                  className="text-lg p-4 bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60"
                />
                <p className="text-sm text-gray-500">Username cannot be changed here.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-lg">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email || ''}
                  readOnly
                  disabled
                  className="text-lg p-4 bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60"
                />
                <p className="text-sm text-gray-500">Email cannot be changed here.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-lg">Display Name</Label>
                <Input
                  id="displayName"
                  placeholder="How you'd like to be addressed"
                  value={formData.displayName}
                  onChange={(e) => updateFormData('displayName', e.target.value)}
                  className="text-lg p-4"
                />
                <p className="text-sm text-gray-500">This is how we'll greet you throughout the app.</p>
              </div>
              <div className="space-y-4">
                <Label className="text-lg">Age Group</Label>
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
            </div>

            {/* Cognitive Health & Goals */}
            <div className="space-y-6 border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Cognitive Health & Goals</h2>
              
              {/* Baseline Cognitive Conditions */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 space-y-4">
                <Label className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">Baseline Cognitive Conditions (Optional)</Label>
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
                  <div key={condition.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-white dark:hover:bg-gray-700 cursor-pointer"
                       onClick={() => toggleArrayItem('cognitiveConditions', condition.id)}>
                    <Checkbox
                      id={condition.id}
                      checked={formData.cognitiveConditions.includes(condition.id)}
                      onChange={() => toggleArrayItem('cognitiveConditions', condition.id)}
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
              </div>

              {/* Workout Goals */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 space-y-4">
                <Label className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">Workout Goals</Label>
                {[
                  { id: 'prevention', label: 'Prevent cognitive decline', desc: 'Stay mentally sharp as I age' },
                  { id: 'recovery', label: 'Cognitive recovery', desc: 'Recover from injury, surgery, or trauma' },
                  { id: 'focus', label: 'Improve focus & concentration', desc: 'Better attention and mental clarity' },
                  { id: 'memory', label: 'Enhance memory', desc: 'Remember names, dates, and details better' },
                  { id: 'stress', label: 'Manage stress & brain fog', desc: 'Reduce mental fatigue and overwhelm' },
                  { id: 'professional', label: 'Maintain professional edge', desc: 'Stay sharp for demanding work' }
                ].map((goal) => (
                  <div key={goal.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-white dark:hover:bg-gray-700 cursor-pointer"
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
              </div>

              {/* Cognitive Focus Areas */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 space-y-4">
                <Label className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">Cognitive Focus Areas</Label>
                {[
                  { id: 'attention', label: 'Attention & Focus', desc: 'Sustained concentration and selective attention' },
                  { id: 'memory', label: 'Memory', desc: 'Working memory, recall, and retention' },
                  { id: 'language', label: 'Language', desc: 'Word finding, comprehension, and communication' },
                  { id: 'executive', label: 'Executive Function', desc: 'Planning, problem-solving, and decision-making' },
                  { id: 'processing', label: 'Processing Speed', desc: 'Quick thinking and mental agility' },
                  { id: 'spatial', label: 'Spatial Reasoning', desc: 'Visual-spatial skills and navigation' },
                  { id: 'creativity', label: 'Creativity', desc: 'Creative thinking and mental flexibility' }
                ].map((area) => (
                  <div key={area.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-white dark:hover:bg-gray-700 cursor-pointer"
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
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Notification Preferences</h2>
              
              {/* Notification Preference */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 space-y-4">
                <Label className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">Reminder Time Preference</Label>
                <RadioGroup
                  value={formData.reminderTime}
                  onValueChange={(value) => updateFormData('reminderTime', value)}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-white dark:hover:bg-gray-700">
                    <RadioGroupItem value="morning" id="rem-morning" />
                    <Label htmlFor="rem-morning" className="text-lg cursor-pointer flex-1">
                      Morning (8-11 AM)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-white dark:hover:bg-gray-700">
                    <RadioGroupItem value="afternoon" id="rem-afternoon" />
                    <Label htmlFor="rem-afternoon" className="text-lg cursor-pointer flex-1">
                      Afternoon (12-5 PM)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-white dark:hover:bg-gray-700">
                    <RadioGroupItem value="evening" id="rem-evening" />
                    <Label htmlFor="rem-evening" className="text-lg cursor-pointer flex-1">
                      Evening (6-9 PM)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-white dark:hover:bg-gray-700">
                    <RadioGroupItem value="no-reminders" id="rem-none" />
                    <Label htmlFor="rem-none" className="text-lg cursor-pointer flex-1">
                      No reminders
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Training Time Preference */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 space-y-4">
                <Label className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">Training Time Preference</Label>
                <RadioGroup
                  value={formData.timePreference}
                  onValueChange={(value) => updateFormData('timePreference', value)}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-white dark:hover:bg-gray-700">
                    <RadioGroupItem value="morning" id="time-morning" />
                    <Label htmlFor="time-morning" className="text-lg cursor-pointer flex-1">
                      Morning (7-11 AM) - Start the day with mental exercise
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-white dark:hover:bg-gray-700">
                    <RadioGroupItem value="afternoon" id="time-afternoon" />
                    <Label htmlFor="time-afternoon" className="text-lg cursor-pointer flex-1">
                      Afternoon (12-5 PM) - Midday mental break
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-white dark:hover:bg-gray-700">
                    <RadioGroupItem value="evening" id="time-evening" />
                    <Label htmlFor="time-evening" className="text-lg cursor-pointer flex-1">
                      Evening (6-9 PM) - Wind down with brain training
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-white dark:hover:bg-gray-700">
                    <RadioGroupItem value="flexible" id="time-flexible" />
                    <Label htmlFor="time-flexible" className="text-lg cursor-pointer flex-1">
                      Flexible - I'll train when it's convenient
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 text-lg"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveChanges}
                className="px-6 py-3 text-lg bg-indigo-600 hover:bg-indigo-700"
              >
                <Save className="w-5 h-5 mr-2" />
                Save All Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <ScrollIndicator />
    </div>
  );
};

export default UserSettings;