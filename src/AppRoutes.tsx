import React from 'react';
import { Routes, Route } from "react-router-dom";
import AuthenticatedLayout from "@/app/layouts/AuthenticatedLayout";
import AdminOnly from "@/guards/AdminOnly";
import ProfileSettings from "@/app/profile/ProfileSettings";
import BillingPanel from "@/app/admin/billing/BillingPanel";
import CampaignCenter from "@/app/campaigns/CampaignCenter";

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
import StrategyWizard from "@/app/strategy-gen/StrategyWizard";
import LeadPipeline from "@/app/leads/LeadPipeline";
import InviteUserForm from "@/app/admin/invite/InviteUserForm";
import CoachingFeed from "@/app/coaching/feed/CoachingFeed";
import InsightsPanel from "@/app/dashboard/insights/InsightsPanel";
import StrategyDetail from "@/app/vault/strategy-detail/[id]";
import NotificationsPage from "@/app/notifications/page";
import PluginsDashboard from "@/app/admin/plugins/PluginsDashboard";
import PluginGallery from "@/app/plugins/gallery/PluginGallery";
import PluginDetail from "@/app/plugins/detail/PluginDetail";
import Docs from "@/pages/Docs";
import Explore from "@/pages/Explore";
import AnalyticsDashboard from "@/app/admin/analytics/AnalyticsDashboard";
import PerformanceDashboard from "@/app/dashboard/performance";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/docs" element={<Docs />} />
      <Route path="/explore" element={<Explore />} />
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
        <Route path="/vault/strategy-detail/:id" element={<StrategyDetail />} />
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
        <Route 
          path="/admin/plugins" 
          element={
            <AdminOnly>
              <PluginsDashboard />
            </AdminOnly>
          } 
        />
        <Route path="/profile/settings" element={<ProfileSettings />} />
        <Route path="/strategy" element={<StrategyWizard />} />
        <Route path="/leads" element={<LeadPipeline />} />
        <Route 
          path="/admin/invite" 
          element={
            <AdminOnly>
              <InviteUserForm />
            </AdminOnly>
          } 
        />
        <Route path="/coaching/feed" element={<CoachingFeed />} />
        <Route path="/dashboard/insights" element={<InsightsPanel />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/admin/plugins/gallery" element={<PluginGallery />} />
        <Route path="/admin/plugins/:pluginKey" element={<PluginDetail />} />
        <Route 
          path="/admin/billing" 
          element={
            <AdminOnly>
              <BillingPanel />
            </AdminOnly>
          } 
        />
        <Route 
          path="/admin/analytics" 
          element={
            <AdminOnly>
              <AnalyticsDashboard />
            </AdminOnly>
          } 
        />
        <Route path="/campaigns/center" element={<CampaignCenter />} />
        <Route path="/dashboard/performance" element={<PerformanceDashboard />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
