import { Routes, Route } from "react-router-dom";
import AuthenticatedLayout from "@/app/layouts/AuthenticatedLayout";
import AdminOnly from "@/guards/AdminOnly";

// Pages
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import OnboardingLayout from "@/app/onboarding/OnboardingLayout";
import OnboardingWizard from "@/app/onboarding/OnboardingWizard";
import StartupDashboard from "@/app/startup/StartupDashboard";
import CampaignPage from "@/app/campaign/CampaignPage";
import VaultItemsList from "@/app/vault/VaultItemsList";
import LaunchPage from "@/app/launch/LaunchPage";
import PocketSwipe from "@/app/pocket/PocketSwipe";
import AcademyFeed from "@/app/academy/AcademyFeed";
import ExplorePage from "@/app/galaxy/explore/ExplorePage";
import SettingsPanel from "@/app/admin/settings/SettingsPanel";
import KpiDashboard from "@/app/insights/kpis/KpiDashboard";
import SeedToolsPanel from "@/app/admin/seed-tools/SeedToolsPanel";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/signup" element={<Signup />} />
      <Route path="/onboarding" element={
        <OnboardingLayout>
          <OnboardingWizard />
        </OnboardingLayout>
      } />
      
      {/* Protected routes */}
      <Route element={<AuthenticatedLayout />}>
        <Route path="/startup" element={<StartupDashboard />} />
        <Route path="/campaign" element={<CampaignPage />} />
        <Route path="/vault" element={<VaultItemsList />} />
        <Route path="/launch" element={<LaunchPage />} />
        <Route path="/pocket" element={<PocketSwipe />} />
        <Route path="/academy" element={<AcademyFeed />} />
        <Route path="/galaxy/explore" element={<ExplorePage />} />
        <Route path="/insights/kpis" element={<KpiDashboard />} />
        <Route 
          path="/admin/settings" 
          element={
            <AdminOnly>
              <SettingsPanel />
            </AdminOnly>
          } 
        />
        <Route 
          path="/admin/seed-tools" 
          element={
            <AdminOnly>
              <SeedToolsPanel />
            </AdminOnly>
          } 
        />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
