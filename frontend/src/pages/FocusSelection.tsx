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
    
    if (!storedData || !mood) {
      navigate('/dashboard');
      return;
    }
    
    setUserData(JSON.parse(storedData));
    setTodaysMood(mood);
  }, [navigate]);

  if (!userData || !todaysMood) {
    return <div>Loading...</div>;
  }

  return <FocusSelection userName={userData.name} todaysMood={todaysMood} />;
};

export default FocusSelectionPage;