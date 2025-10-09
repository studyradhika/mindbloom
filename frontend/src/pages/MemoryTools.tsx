import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, Home, LogOut, ArrowLeft } from "lucide-react";
import MemoryNotebook from "@/components/MemoryNotebook";
import ProfileSettingsButton from "@/components/ProfileSettingsButton"; // Import the new component

const MemoryTools = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('mindbloom-user');
    if (storedData) {
      setUserData(JSON.parse(storedData));
    } else {
      navigate('/onboarding');
    }
  }, [navigate]);

  const handleSignOut = () => {
    // Clear all user data
    localStorage.removeItem('mindbloom-user');
    localStorage.removeItem('mindbloom-today-mood');
    localStorage.removeItem('mindbloom-last-mood-date');
    localStorage.removeItem('mindbloom-today-focus-areas');
    localStorage.removeItem('mindbloom-last-focus-date');
    localStorage.removeItem('mindbloom-notes');
    localStorage.removeItem('mindbloom-checklists');
    localStorage.removeItem('mindbloom-reminders');
    
    navigate('/goodbye');
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* LEFT: Home Button and Back to Dashboard Button */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="px-3 py-2 text-gray-600 hover:text-gray-800"
            >
              <Home className="w-4 h-4 mr-1" />
              Home
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="px-3 py-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          
          {/* CENTER: Memory Notebook Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
            <Brain className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Memory Notebook</h1>
          </div>
          
          {/* RIGHT: Settings, Sign Out, and User Greeting */}
          <div className="flex items-center space-x-2">
            <ProfileSettingsButton /> {/* Add the settings button here */}
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Sign Out
            </Button>
            <div className="flex items-center justify-center px-3 py-1 bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-medium rounded-full">
              Hi, {userData.displayName || userData.name}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-8">
        <MemoryNotebook userData={userData} />
      </main>
    </div>
  );
};

export default MemoryTools;