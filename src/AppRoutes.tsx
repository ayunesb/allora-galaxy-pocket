import React from 'react';
import { Routes, Route } from "react-router-dom";
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

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<StartupDashboard />} />
      <Route path="/startup" element={<StartupDashboard />} />
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
        <Route path="/startup" element={
          <ErrorBoundary>
            <StartupDashboard />
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
