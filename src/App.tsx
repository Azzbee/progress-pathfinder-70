import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { UserSettingsProvider } from "@/hooks/useUserSettings";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import Progress from "./pages/Progress";
import Discipline from "./pages/Discipline";
import Leaderboard from "./pages/Leaderboard";
import AICoach from "./pages/AICoach";
import Settings from "./pages/Settings";
import Contact from "./pages/Contact";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <React.Fragment>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UserSettingsProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/discipline" element={<Discipline />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/ai-coach" element={<AICoach />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </UserSettingsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.Fragment>
  );
}

export default App;
