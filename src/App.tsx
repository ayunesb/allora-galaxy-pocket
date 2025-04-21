import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { TenantProvider } from "@/hooks/useTenant";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import OnboardingLayout from "./app/onboarding/OnboardingLayout";
import OnboardingWizard from "./app/onboarding/OnboardingWizard";
import PocketLayout from "./app/pocket/PocketLayout";
import PocketSwipe from "./app/pocket/PocketSwipe";
import ExplorePage from "./app/galaxy/explore/ExplorePage";
import AcademyFeed from "./app/academy/AcademyFeed";
import VaultItemsList from "./app/vault/VaultItemsList";
import StartupDashboard from "./app/startup/StartupDashboard";
import LaunchPage from "./app/launch/LaunchPage";
import CampaignPage from "./app/campaign/CampaignPage";
import SettingsPanel from "./app/admin/settings/SettingsPanel";
import RequireAuth from "./guards/RequireAuth";
import KpiDashboard from "./app/insights/kpis/KpiDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TenantProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/signup" element={<Signup />} />
              <Route path="/onboarding" element={
                <OnboardingLayout>
                  <OnboardingWizard />
                </OnboardingLayout>
              } />
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
              <Route path="/launch" element={<LaunchPage />} />
              <Route path="/campaign" element={<CampaignPage />} />
              <Route 
                path="/admin/settings" 
                element={
                  <RequireAuth>
                    <SettingsPanel />
                  </RequireAuth>
                } 
              />
              <Route path="/insights/kpis" element={<KpiDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </TenantProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
