import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FocusSelection from "@/components/FocusSelection";

const FocusSelectionPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [todaysMood, setTodaysMood] = useState<string>('');

  useEffect(() => {
    const storedData = localStorage.getItem('mindbloom-user');
    const mood = localStorage.getItem('mindbloom-today-mood');
    
    console.log('🎯 FocusSelection: Checking data - User:', !!storedData, 'Mood:', mood);
    
    if (!storedData) {
      console.log('🎯 FocusSelection: No user data, redirecting to onboarding');
      navigate('/onboarding');
      return;
    }
    
    if (!mood) {
      console.log('🎯 FocusSelection: No mood data, redirecting to dashboard for mood selection');
      navigate('/dashboard');
      return;
    }
    
    console.log('🎯 FocusSelection: All data present, setting up page');
    setUserData(JSON.parse(storedData));
    setTodaysMood(mood);
  }, [navigate]);

  if (!userData || !todaysMood) {
    return <div>Loading...</div>;
  }

  return <FocusSelection userName={userData.displayName || userData.name} todaysMood={todaysMood} />;
};

export default FocusSelectionPage;