
import React from 'react';
import { RouteObject } from 'react-router-dom';
import StartupPage from "@/app/startup/page";
import RecoveryPage from "@/pages/recovery/page";
import CreateGalaxyPage from "@/app/galaxy/create/page";
import CoachingFeed from "@/app/coaching/feed/CoachingFeed";
import LaunchPageWrapper from "@/app/launch/page";
import StrategyPage from "@/app/strategy/page";
import StrategyDetail from "@/app/strategy/[id]";
import AssistantPage from "@/app/assistant/page";
import AgentsPage from "@/app/agents/page";
import CreativeSuitePage from "@/app/creative/SuitePanel";
import CampaignDetailPage from "@/app/campaigns/[id]";
import CampaignCreatePage from "@/app/campaigns/create";
import CampaignWizard from "@/app/campaigns/create/CampaignWizard";
import CampaignCenterPage from "@/app/campaigns/center/page";
import CampaignsPage from "@/app/campaigns/page";
import AgentBlueprintGallery from "@/app/galaxy/agents/page";
import NotificationsPage from "@/app/notifications/page";
import VaultStrategyCreator from "@/app/vault/create/page";
import KpiDashboard from "@/app/kpi/dashboard";
import AddKpiPage from "@/app/kpi/add";

export const appRoutes: RouteObject[] = [
  { path: "/startup", element: <StartupPage /> },
  { path: "/recovery", element: <RecoveryPage /> },
  { path: "/galaxy/create", element: <CreateGalaxyPage /> },
  { path: "/coaching/feed", element: <CoachingFeed /> },
  { path: "/launch", element: <LaunchPageWrapper /> },
  
  // Strategy routes
  { path: "/strategy", element: <StrategyPage /> },
  { path: "/strategy/:id", element: <StrategyDetail /> },
  
  // Campaign routes
  { path: "/campaigns", element: <CampaignsPage /> },
  { path: "/campaigns/create", element: <CampaignCreatePage /> },
  { path: "/campaigns/wizard", element: <CampaignWizard /> },
  { path: "/campaigns/center", element: <CampaignCenterPage /> },
  { path: "/campaigns/:id", element: <CampaignDetailPage /> },
  
  // KPI routes
  { path: "/kpi/dashboard", element: <KpiDashboard /> },
  { path: "/kpi/add", element: <AddKpiPage /> },
  
  // Other routes
  { path: "/assistant", element: <AssistantPage /> },
  { path: "/agents", element: <AgentsPage /> },
  { path: "/creative/suite", element: <CreativeSuitePage /> },
  { path: "/galaxy/agents", element: <AgentBlueprintGallery /> },
  { path: "/notifications", element: <NotificationsPage /> },
  { path: "/vault/create", element: <VaultStrategyCreator /> }
];
