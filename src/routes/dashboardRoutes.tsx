
import React from 'react';
import { RouteObject } from 'react-router-dom';
// DASHBOARD MAIN
import DashboardHome from "@/app/dashboard"; // Main dashboard page
import DashboardInsights from "@/app/dashboard/insights/DashboardInsights";
import TeamActivityDashboard from "@/app/dashboard/team-activity/TeamActivityDashboard";
import PerformanceDashboard from "@/app/dashboard/performance";
import InsightsPanel from "@/app/dashboard/insights/InsightsPanel";
import KpiAlertsPage from "@/app/dashboard/kpi-alerts/page";
import IncidentTimeline from "@/app/dashboard/incidents/page";
import AlertsDashboard from "@/app/dashboard/alerts/page";
import KPIAlertRules from "@/app/dashboard/kpi-alerts/KpiAlertRules";
// Campaign Routes
import CampaignCenterPage from "@/app/campaigns/center/page";
// Notifications Route
import NotificationsPage from "@/app/notifications/page";
// FALLBACK/MINIMAL "PAGE" ROUTES
import RecoveryPage from "@/pages/recovery/page";
import PluginLeaderboard from "@/pages/plugins/leaderboard";
// KPI Dashboard Route
import KpiDashboard from "@/app/insights/kpis/KpiDashboard";

export const dashboardRoutes: RouteObject[] = [
  { path: "/dashboard", element: <DashboardHome /> },
  { path: "/dashboard/insights", element: <DashboardInsights /> },
  { path: "/dashboard/team-activity", element: <TeamActivityDashboard /> },
  { path: "/dashboard/performance", element: <PerformanceDashboard /> },
  { path: "/dashboard/insights-panel", element: <InsightsPanel /> },
  { path: "/dashboard/kpi-alerts", element: <KpiAlertsPage /> },
  { path: "/dashboard/incidents", element: <IncidentTimeline /> },
  { path: "/dashboard/alerts", element: <AlertsDashboard /> },
  { path: "/dashboard/kpi-alert-rules", element: <KPIAlertRules /> },
  { path: "/campaigns/center", element: <CampaignCenterPage /> },
  { path: "/notifications", element: <NotificationsPage /> },
  { path: "/recovery", element: <RecoveryPage /> },
  { path: "/galaxy/plugins", element: <PluginLeaderboard /> },
  { path: "/insights/kpis", element: <KpiDashboard /> },
];
