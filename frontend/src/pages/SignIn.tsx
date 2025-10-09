"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "@/utils/toast";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignInSubmit = () => {
    if (!email.trim() || !password.trim()) {
      showError("Please enter both email and password.");
      return;
    }

    // Simulate a successful login for any input for frontend-only demo
    // In a real app, you would validate credentials against a backend
    
    let userData = null;
    const storedUserData = localStorage.getItem('mindbloom-user');

    if (storedUserData) {
      userData = JSON.parse(storedUserData);
      // If existing user, ensure email matches (for demo purposes, we'll just update it)
      // In a real app, you'd verify password and email.
      if (userData.email !== email) {
        showError("Email does not match existing user. Please register or use the correct email.");
        return;
      }
    } else {
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
    }
    
    localStorage.setItem('mindbloom-user', JSON.stringify(userData));
    
    // Clear any existing mood and focus data to force mood check for the new day
    localStorage.removeItem('mindbloom-today-mood');
    localStorage.removeItem('mindbloom-last-mood-date');
    localStorage.removeItem('mindbloom-today-focus-areas');
    localStorage.removeItem('mindbloom-last-focus-date');

    showSuccess("Signed in successfully! Welcome back.");
    navigate('/dashboard');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleSignUp = () => {
    navigate('/registration');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MindBloom</h1>
          </div>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription className="text-lg">
            Welcome back! Enter your credentials to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-lg">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-lg p-4"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-lg">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-lg p-4"
            />
          </div>

          <Button
            onClick={handleSignInSubmit}
            className="w-full text-lg px-6 py-3 bg-indigo-600 hover:bg-indigo-700"
          >
            Sign In
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Button variant="link" onClick={handleSignUp} className="p-0 h-auto text-indigo-600 hover:text-indigo-700">
              Sign Up
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
    </div>
  );
};

export default SignIn;