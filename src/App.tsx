import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import OnboardingLayout from "./app/onboarding/OnboardingLayout";
import OnboardingWizard from "./app/onboarding/OnboardingWizard";
import PocketLayout from "./app/pocket/PocketLayout";
import PocketSwipe from "./app/pocket/PocketSwipe";
import ExplorePage from "./app/galaxy/explore/ExplorePage";
import AcademyFeed from "./app/academy/AcademyFeed";
import VaultItemsList from "./app/vault/VaultItemsList";
import StartupDashboard from "./app/startup/StartupDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route 
            path="/onboarding" 
            element={
              <OnboardingLayout>
                <OnboardingWizard />
              </OnboardingLayout>
            } 
          />
          <Route
            path="/pocket"
            element={
              <PocketLayout>
                <PocketSwipe />
              </PocketLayout>
            }
          />
          <Route path="/galaxy/explore" element={<ExplorePage />} />
          <Route path="/academy" element={<AcademyFeed />} />
          <Route path="/vault" element={<VaultItemsList />} />
          <Route path="/startup" element={<StartupDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
