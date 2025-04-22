import React from 'react';
import { RouteObject } from 'react-router-dom';
import AuthenticatedLayout from "@/app/layouts/AuthenticatedLayout";
import VaultItemsList from "@/app/vault/VaultItemsList";
import StrategyDetail from "@/app/vault/strategy-detail/[id]";
import LaunchPage from "@/app/launch/LaunchPage";
import PocketSwipe from "@/app/pocket/PocketSwipe";
import AcademyFeed from "@/app/academy/AcademyFeed";
import ExplorePage from "@/app/galaxy/explore/ExplorePage";
import KpiDashboard from "@/app/insights/kpis/KpiDashboard";
import SettingsPage from "@/app/settings/SettingsPage";
import ProfileSettings from "@/app/profile/ProfileSettings";
import StrategyWizard from "@/app/strategy-gen/StrategyWizard";
import SingleStrategyDetail from "@/app/strategy/[id]";
import SingleCampaignDetail from "@/app/campaigns/[id]";
import LeadPipeline from "@/app/leads/LeadPipeline";
import CoachingFeed from "@/app/coaching/feed/CoachingFeed";
import NotificationsPage from "@/app/notifications/page";
import GrowthPanel from "@/app/notifications/GrowthPanel";
import PluginGallery from "@/app/plugins/gallery/PluginGallery";
import PluginDetail from "@/app/plugins/detail/PluginDetail";
import CampaignCenter from "@/app/campaigns/CampaignCenter";
import AutopilotPanel from "@/app/shopify/AutopilotPanel";
import CreativeSuite from "@/app/creative/SuitePanel";
import AssistantPanel from "@/app/assistant/AssistantPanel";
import ExportPanel from "@/app/export/ExportPanel";
import PricingPage from "@/pages/Pricing";
import AgentSpacePage from "@/app/agents/AgentSpacePage";
import PluginSettings from "@/app/plugins/settings/page";
import CampaignPage from "@/app/campaign/CampaignPage";
import PluginMyPage from "@/pages/plugins/my";
import GalaxyExplorePage from "@/pages/galaxy/explore/page";
import RecoveryPage from "@/pages/recovery/page";

export const appRoutes: RouteObject[] = [
  { path: "/vault", element: <VaultItemsList /> },
  { path: "/vault/strategy-detail/:id", element: <StrategyDetail /> },
  { path: "/launch", element: <LaunchPage /> },
  { path: "/pocket", element: <PocketSwipe /> },
  { path: "/academy", element: <AcademyFeed /> },
  { path: "/galaxy/explore", element: <GalaxyExplorePage /> },
  { path: "/insights/kpis", element: <KpiDashboard /> },
  { path: "/settings", element: <SettingsPage /> },
  { path: "/profile/settings", element: <ProfileSettings /> },
  { path: "/strategy", element: <StrategyWizard /> },
  { path: "/strategy/:id", element: <SingleStrategyDetail /> },
  { path: "/campaigns/:id", element: <SingleCampaignDetail /> },
  { path: "/leads", element: <LeadPipeline /> },
  { path: "/coaching/feed", element: <CoachingFeed /> },
  { path: "/notifications", element: <NotificationsPage /> },
  { path: "/notifications/growth", element: <GrowthPanel /> },
  { path: "/admin/plugins/gallery", element: <PluginGallery /> },
  { path: "/admin/plugins/:pluginKey", element: <PluginDetail /> },
  { path: "/campaigns/center", element: <CampaignCenter /> },
  { path: "/shopify/autopilot", element: <AutopilotPanel /> },
  { path: "/creative/suite", element: <CreativeSuite /> },
  { path: "/assistant", element: <AssistantPanel /> },
  { path: "/export", element: <ExportPanel /> },
  { path: "/pricing", element: <PricingPage /> },
  { path: "/agents", element: <AgentSpacePage /> },
  { path: "/plugins/settings", element: <PluginSettings /> },
  { path: "/campaign", element: <CampaignPage /> },
  { path: "/plugins/my", element: <PluginMyPage /> },
  { path: "/recovery", element: <RecoveryPage /> }
];
