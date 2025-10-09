import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { showSuccess } from "@/utils/toast";

const ClearUserData = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear all MindBloom-related items from localStorage
    localStorage.removeItem('mindbloom-user');
    localStorage.removeItem('mindbloom-today-mood');
    localStorage.removeItem('mindbloom-last-mood-date');
    localStorage.removeItem('mindbloom-today-focus-areas');
    localStorage.removeItem('mindbloom-last-focus-date');
    localStorage.removeItem('mindbloom-notes');
    localStorage.removeItem('mindbloom-checklists');
    localStorage.removeItem('mindbloom-reminders');

    showSuccess("All user data has been cleared!");
    navigate('/'); // Redirect to the home page
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <p className="text-xl text-gray-700 dark:text-gray-300">Clearing user data...</p>
    </div>
  );
};

export default ClearUserData;