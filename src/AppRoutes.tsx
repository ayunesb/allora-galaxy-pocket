
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import AuthenticatedLayout from "@/app/layouts/AuthenticatedLayout";
import DashboardHome from "@/app/dashboard";
import AdminOnly from "@/guards/AdminOnly";
import ProfileSettings from "@/app/profile/ProfileSettings";
import BillingPanel from "@/app/admin/billing/BillingPanel";
import CampaignCenter from "@/app/campaigns/CampaignCenter";
import AutopilotPanel from "@/app/shopify/AutopilotPanel";
import CreativeSuite from "@/app/creative/SuitePanel";
import AssistantPanel from "@/app/assistant/AssistantPanel";
import GrowthPanel from "@/app/notifications/GrowthPanel";
import ExportPanel from "@/app/export/ExportPanel";
import PricingPage from "@/pages/Pricing";
import SettingsPage from "@/app/settings/SettingsPage";

// Import startup dashboard and other public pages
import StartupDashboard from "@/app/startup/StartupDashboard";
import Docs from "@/pages/Docs";
import Explore from "@/pages/Explore";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";

// Import legal pages
import TermsOfUse from "@/pages/legal/terms";
import PrivacyPolicy from "@/pages/legal/privacy";
import CookiePolicy from "@/pages/legal/cookie";
import AIDisclosure from "@/pages/legal/ai-disclosure";
import DataProcessingAddendum from "@/pages/legal/dpa";

// Import onboarding components
import OnboardingLayout from "@/app/onboarding/OnboardingLayout";
import OnboardingWizard from "@/app/onboarding/OnboardingWizard";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Import authenticated route components
import VaultItemsList from "@/app/vault/VaultItemsList";
import StrategyDetail from "@/app/vault/strategy-detail/[id]";
import LaunchPage from "@/app/launch/LaunchPage";
import PocketSwipe from "@/app/pocket/PocketSwipe";
import AcademyFeed from "@/app/academy/AcademyFeed";
import ExplorePage from "@/app/galaxy/explore/ExplorePage";
import KpiDashboard from "@/app/insights/kpis/KpiDashboard";
import SettingsPanel from "@/app/admin/settings/SettingsPanel";
import SeedToolsPanel from "@/app/admin/seed-tools/SeedToolsPanel";
import PluginsDashboard from "@/app/admin/plugins/PluginsDashboard";
import StrategyWizard from "@/app/strategy-gen/StrategyWizard";
import LeadPipeline from "@/app/leads/LeadPipeline";
import InviteUserForm from "@/app/admin/invite/InviteUserForm";
import CoachingFeed from "@/app/coaching/feed/CoachingFeed";
import InsightsPanel from "@/app/dashboard/insights/InsightsPanel";
import NotificationsPage from "@/app/notifications/page";
import PluginGallery from "@/app/plugins/gallery/PluginGallery";
import PluginDetail from "@/app/plugins/detail/PluginDetail";
import AnalyticsDashboard from "@/app/admin/analytics/AnalyticsDashboard";
import PerformanceDashboard from "@/app/dashboard/performance";
import CampaignPage from "@/app/campaign/CampaignPage";
import NotFound from "@/pages/NotFound";

// Import new dynamic route components
import SingleStrategyDetail from "@/app/strategy/[id]";
import SingleCampaignDetail from "@/app/campaigns/[id]";
import DashboardInsights from "@/app/dashboard/insights/DashboardInsights";

// Import new team activity dashboard
import TeamActivityDashboard from "@/app/dashboard/team-activity/TeamActivityDashboard";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/startup" element={<Navigate to="/dashboard" replace />} />
      <Route path="/docs" element={<Docs />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/signup" element={<Signup />} />
      <Route path="/onboarding" element={
        <ErrorBoundary>
          <OnboardingLayout>
            <OnboardingWizard />
          </OnboardingLayout>
        </ErrorBoundary>
      } />
      
      {/* Legal routes - publicly accessible */}
      <Route path="/legal/terms" element={<TermsOfUse />} />
      <Route path="/legal/privacy" element={<PrivacyPolicy />} />
      <Route path="/legal/cookie" element={<CookiePolicy />} />
      <Route path="/legal/ai-disclosure" element={<AIDisclosure />} />
      <Route path="/legal/dpa" element={<DataProcessingAddendum />} />
      
      {/* Protected routes */}
      <Route element={<AuthenticatedLayout />}>
        <Route path="/dashboard" element={
          <ErrorBoundary>
            <DashboardHome />
          </ErrorBoundary>
        } />
        <Route path="/campaign" element={
          <ErrorBoundary>
            <CampaignPage />
          </ErrorBoundary>
        } />
        <Route path="/vault" element={<VaultItemsList />} />
        <Route path="/vault/strategy-detail/:id" element={<StrategyDetail />} />
        <Route path="/launch" element={<LaunchPage />} />
        <Route path="/pocket" element={<PocketSwipe />} />
        <Route path="/academy" element={<AcademyFeed />} />
        <Route path="/galaxy/explore" element={<ExplorePage />} />
        <Route path="/insights/kpis" element={<KpiDashboard />} />
        <Route path="/settings" element={<SettingsPage />} />
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
        <Route path="/strategy/:id" element={<SingleStrategyDetail />} />
        <Route path="/campaigns/:id" element={<SingleCampaignDetail />} />
        <Route path="/dashboard/insights" element={<DashboardInsights />} />
        <Route 
          path="/dashboard/team-activity" 
          element={
            <AdminOnly>
              <TeamActivityDashboard />
            </AdminOnly>
          } 
        />
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
        <Route path="/notifications/growth" element={<GrowthPanel />} />
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
        <Route path="/shopify/autopilot" element={<AutopilotPanel />} />
        <Route path="/creative/suite" element={<CreativeSuite />} />
        <Route path="/assistant" element={<AssistantPanel />} />
        <Route path="/export" element={<ExportPanel />} />
        <Route path="/pricing" element={<PricingPage />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
