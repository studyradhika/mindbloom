import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { showSuccess } from "@/utils/toast";

const ClearUserData = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🧹 ClearUserData: Starting to clear all user data...');
    
    // Clear all MindBloom-related items from localStorage
    localStorage.removeItem('mindbloom-user');
    localStorage.removeItem('mindbloom-today-mood');
    localStorage.removeItem('mindbloom-last-mood-date');
    localStorage.removeItem('mindbloom-today-focus-areas');
    localStorage.removeItem('mindbloom-last-focus-date');
    localStorage.removeItem('mindbloom-notes');
    localStorage.removeItem('mindbloom-checklists');
    localStorage.removeItem('mindbloom-reminders');

    // Clear all persistent profile data (mindbloom-profile-* keys)
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('mindbloom-profile-')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      console.log('🧹 ClearUserData: Removing persistent profile:', key);
      localStorage.removeItem(key);
    });

    console.log('🧹 ClearUserData: All user data cleared successfully');
    showSuccess("All user data has been cleared! You can now create fresh profiles.");
    navigate('/'); // Redirect to the home page
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <p className="text-xl text-gray-700 dark:text-gray-300">Clearing user data...</p>
    </div>
  );
};

export default ClearUserData;