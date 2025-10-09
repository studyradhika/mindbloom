import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { showSuccess, showError } from "@/utils/toast";
import ScrollIndicator from "@/components/ui/scroll-indicator";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    // Check if we should default to registration mode
    const urlMode = searchParams.get('mode');
    if (urlMode === 'register') {
      setMode('register');
    }
  }, [searchParams]);

  const handleSignInSubmit = () => {
    if (!email.trim() || !password.trim()) {
      showError("Please enter both email and password.");
      return;
    }

    // Simulate a successful login for any input for frontend-only demo
    // In a real app, you would validate credentials against a backend
    
    let userData = null;
    
    // Check for existing user profile using a persistent key based on email
    const userProfileKey = `mindbloom-profile-${email.toLowerCase()}`;
    const storedUserProfile = localStorage.getItem(userProfileKey);
    
    console.log('🔐 Auth: Attempting sign in with email:', email);
    console.log('🔐 Auth: Looking for profile with key:', userProfileKey);
    console.log('🔐 Auth: Existing stored user profile:', storedUserProfile ? JSON.parse(storedUserProfile) : 'None');

    if (storedUserProfile) {
      userData = JSON.parse(storedUserProfile);
      console.log('🔐 Auth: Found existing user profile, restoring data');
    } else {
      console.log('🔐 Auth: No existing user profile found, creating new profile');
      // If no existing user, create a new default profile
      userData = {
        name: email.split('@')[0] || 'User', // Use part of email as default name
        email: email,
        ageGroup: '50-59', // Default values for new user
        goals: ['prevention', 'focus', 'memory'],
        cognitiveAreas: ['memory', 'attention', 'language'],
        experience: 'some',
        timePreference: 'morning',
        onboardingCompleted: true,
        joinDate: new Date().toISOString(),
        streak: 0,
        totalSessions: 0,
        lastSessionDate: null,
        lastSessionScore: null,
        lastSessionDuration: null,
        exerciseHistory: [],
        exerciseStats: {}
      };
      
      // Save the new profile persistently
      localStorage.setItem(userProfileKey, JSON.stringify(userData));
      console.log('🔐 Auth: New profile saved with key:', userProfileKey);
    }
    
    console.log('🔐 Auth: Final user data to save:', userData);
    localStorage.setItem('mindbloom-user', JSON.stringify(userData));
    
    // Verify the data was saved
    const savedData = localStorage.getItem('mindbloom-user');
    console.log('🔐 Auth: Data saved to localStorage:', JSON.parse(savedData || '{}'));
    
    // Clear any existing mood and focus data to force mood check for the new day
    localStorage.removeItem('mindbloom-today-mood');
    localStorage.removeItem('mindbloom-last-mood-date');
    localStorage.removeItem('mindbloom-today-focus-areas');
    localStorage.removeItem('mindbloom-last-focus-date');

    showSuccess("Signed in successfully! Welcome back.");
    navigate('/dashboard');
  };

  const handleRegisterSubmit = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      showError("Please fill in all fields.");
      return;
    }

    // Store registration data temporarily and navigate to registration flow
    const registrationData = {
      name: name.trim(),
      email: email.toLowerCase(),
      password: password
    };
    
    localStorage.setItem('mindbloom-registration-temp', JSON.stringify(registrationData));
    navigate('/registration');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MindBloom</h1>
          </div>
          <CardTitle className="text-2xl">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-lg">
            {mode === 'signin' 
              ? 'Welcome back! Enter your credentials to continue.' 
              : 'Join MindBloom to start your cognitive wellness journey.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
            {/* Hidden honeypot fields to confuse autofill */}
            <div style={{ display: 'none' }}>
              <input type="email" name="fake_email" tabIndex={-1} />
              <input type="password" name="fake_password" tabIndex={-1} />
            </div>
            
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-lg">Your Name</Label>
                <Input
                  id="name"
                  name="fullname"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-lg p-4"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-form-type="other"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg">Email address</Label>
              <Input
                id="email"
                name="user_email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-lg p-4"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-form-type="other"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-lg">Password</Label>
              <Input
                id="password"
                name="user_password"
                type="password"
                placeholder={mode === 'signin' ? "Enter your password" : "Create a secure password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-lg p-4"
                autoComplete="new-password"
                data-form-type="other"
              />
            </div>
          </form>

          <Button
            onClick={mode === 'signin' ? handleSignInSubmit : handleRegisterSubmit}
            className="w-full text-lg px-6 py-3 bg-indigo-600 hover:bg-indigo-700"
          >
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => {
                setMode(mode === 'signin' ? 'register' : 'signin');
                setName('');
                setEmail('');
                setPassword('');
              }}
              className="text-indigo-600 hover:text-indigo-700"
            >
              {mode === 'signin'
                ? "Don't have an account? Create one"
                : "Already have an account? Sign in"
              }
            </Button>
          </div>
          
          <div className="text-center">
            <Button variant="link" onClick={handleBackToHome} className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
      <ScrollIndicator />
    </div>
  );
};

export default Auth;