import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Index from "./pages/Index";
import Registration from "./pages/Registration";
import SeeYouTomorrow from "./pages/SeeYouTomorrow";
import Goodbye from "./pages/Goodbye";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Training from "./pages/Training";
import SessionComplete from "./pages/SessionComplete";
import MemoryTools from "./pages/MemoryTools";
import Progress from "./pages/Progress";
import FocusSelection from "./pages/FocusSelection";
import BrainTips from "./pages/BrainTips";
import SignIn from "./pages/SignIn";
import UserSettings from "./pages/UserSettings";
import ClearUserData from "./pages/ClearUserData"; // Import the new ClearUserData component
import Auth from "./pages/Auth"; // Import the new Auth component
import Benefits from "./pages/Benefits"; // Import the new Benefits component
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/mindbloom" element={<Index />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/see-you-tomorrow" element={<SeeYouTomorrow />} />
          <Route path="/goodbye" element={<Goodbye />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/focus-selection" element={<FocusSelection />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/training" element={<Training />} />
          <Route path="/session-complete" element={<SessionComplete />} />
          <Route path="/memory-tools" element={<MemoryTools />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/brain-tips" element={<BrainTips />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/auth" element={<Auth />} /> {/* Add the new Auth route */}
          <Route path="/benefits" element={<Benefits />} /> {/* Add the new Benefits route */}
          <Route path="/settings" element={<UserSettings />} />
          <Route path="/clear-data" element={<ClearUserData />} /> {/* Add the new ClearUserData route */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;