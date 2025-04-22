
import React from 'react';
import { RouteObject } from 'react-router-dom';
import DashboardHome from "@/app/dashboard";
import DashboardInsights from "@/app/dashboard/insights/DashboardInsights";
import TeamActivityDashboard from "@/app/dashboard/team-activity/TeamActivityDashboard";
import PerformanceDashboard from "@/app/dashboard/performance";
import InsightsPanel from "@/app/dashboard/insights/InsightsPanel";
import KpiAlertsPage from "@/app/dashboard/kpi-alerts/page";
import IncidentTimeline from "@/app/dashboard/incidents/page";

export const dashboardRoutes: RouteObject[] = [
  { path: "/dashboard", element: <DashboardHome /> },
  { path: "/dashboard/insights", element: <DashboardInsights /> },
  { path: "/dashboard/team-activity", element: <TeamActivityDashboard /> },
  { path: "/dashboard/performance", element: <PerformanceDashboard /> },
  { path: "/dashboard/insights", element: <InsightsPanel /> },
  { path: "/dashboard/kpi-alerts", element: <KpiAlertsPage /> },
  { path: "/dashboard/incidents", element: <IncidentTimeline /> }
];
