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

  const handleSignInSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      showError("Please enter both email and password.");
      return;
    }

    try {
      console.log('🔐 SignIn: Attempting backend authentication for:', email);
      
      // Create form data for OAuth2PasswordRequestForm
      const formData = new FormData();
      formData.append('username', email); // OAuth2 uses 'username' field for email
      formData.append('password', password);

      // Call backend authentication endpoint
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        console.log('🔐 SignIn: Response not OK, status:', response.status, response.statusText);
        
        if (response.status === 401) {
          // Check if user exists in database first
          console.log('🔐 SignIn: 401 Unauthorized - checking if user exists');
          try {
            const checkResponse = await fetch(`http://localhost:8000/api/v1/check-user/${encodeURIComponent(email)}`);
            if (checkResponse.ok) {
              const checkData = await checkResponse.json();
              if (!checkData.exists) {
                // Case 2: New user trying to sign in -> redirect to create account
                console.log('🔐 SignIn: User does not exist - redirecting to registration');
                showError("Account not found. Let's create a new account for you.");
                setTimeout(() => {
                  navigate('/auth?mode=register');
                }, 2000);
                return;
              }
            }
          } catch (checkError) {
            console.log('🔐 SignIn: Error checking user existence:', checkError);
          }
          
          // User exists but wrong password
          console.log('🔐 SignIn: User exists but wrong password');
          showError("Invalid email or password. Please check your credentials.");
          return;
        }
        
        try {
          const errorData = await response.json();
          console.log('🔐 SignIn: Authentication failed:', errorData);
          
          // Handle specific error messages from backend
          if (errorData.detail) {
            if (errorData.detail.includes('not found') || errorData.detail.includes('does not exist')) {
              showError("Account not found. Please check your email or sign up for a new account.");
            } else if (errorData.detail.includes('password') || errorData.detail.includes('credentials')) {
              showError("Invalid email or password. Please check your credentials or sign up for a new account.");
            } else {
              showError(errorData.detail);
            }
          } else {
            showError("Invalid email or password. Please check your credentials or sign up for a new account.");
          }
        } catch (parseError) {
          console.log('🔐 SignIn: Could not parse error response:', parseError);
          showError("Invalid email or password. Please check your credentials or sign up for a new account.");
        }
        return;
      }

      const tokenData = await response.json();
      console.log('🔐 SignIn: Authentication successful, received token');

      // Get user information using the token
      const userResponse = await fetch('http://localhost:8000/api/v1/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        console.log('🔐 SignIn: Failed to get user info');
        showError("Failed to get user information.");
        return;
      }

      const userData = await userResponse.json();
      console.log('🔐 SignIn: User data received:', userData);

      // Store token and user data in localStorage
      localStorage.setItem('mindbloom-token', tokenData.access_token);
      localStorage.setItem('mindbloom-user', JSON.stringify(userData));
      
      // Clear any existing mood and focus data to force mood check for the new day
      localStorage.removeItem('mindbloom-today-mood');
      localStorage.removeItem('mindbloom-last-mood-date');
      localStorage.removeItem('mindbloom-today-focus-areas');
      localStorage.removeItem('mindbloom-last-focus-date');

      showSuccess("Signed in successfully! Welcome back.");
      navigate('/dashboard');

    } catch (error) {
      console.error('🔐 SignIn: Network error caught in catch block:', error);
      showError("Network error. Please check your connection and try again.");
    }
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
              placeholder="Enter your password"
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