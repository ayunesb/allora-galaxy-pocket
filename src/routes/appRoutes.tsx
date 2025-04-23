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
import CampaignCenterPage from "@/app/campaigns/center/page";
import AgentBlueprintGallery from "@/app/galaxy/agents/page";

export const appRoutes: RouteObject[] = [
  { path: "/startup", element: <StartupPage /> },
  { path: "/recovery", element: <RecoveryPage /> },
  { path: "/galaxy/create", element: <CreateGalaxyPage /> },
  { path: "/coaching/feed", element: <CoachingFeed /> },
  { path: "/launch", element: <LaunchPageWrapper /> },
  { path: "/strategy", element: <StrategyPage /> },
  { path: "/strategy/:id", element: <StrategyDetail /> },
  { path: "/assistant", element: <AssistantPage /> },
  { path: "/agents", element: <AgentsPage /> },
  { path: "/creative/suite", element: <CreativeSuitePage /> },
  { path: "/galaxy/agents", element: <AgentBlueprintGallery /> },
  { path: "/campaigns/center", element: <CampaignCenterPage /> },
  { path: "/campaigns/:id", element: <CampaignDetailPage /> }
];
