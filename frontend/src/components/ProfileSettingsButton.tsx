import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfileSettingsButton = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('mindbloom-user');
    setIsLoggedIn(!!userData);
  }, []);

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  if (!isLoggedIn) {
    return null; // Don't render if not logged in
  }

  return (
    <Button 
      variant="ghost" 
      onClick={handleSettingsClick}
      className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
    >
      <Settings className="w-4 h-4 mr-1" />
      Settings
    </Button>
  );
};

export default ProfileSettingsButton;