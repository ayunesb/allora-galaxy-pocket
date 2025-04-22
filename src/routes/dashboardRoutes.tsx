
import React from 'react';
import { RouteObject } from 'react-router-dom';
import DashboardPage from "@/app/dashboard/page";
import StartupDashboard from "@/app/startup/StartupDashboard";
import KpiDashboard from "@/app/insights/kpis/KpiDashboard";
import TeamActivityDashboard from "@/app/dashboard/team-activity/TeamActivityDashboard";
import IncidentsDashboard from "@/app/dashboard/incidents/page";
import AlertsDashboard from "@/app/dashboard/alerts/AlertsDashboard";
import DashboardInsights from "@/app/dashboard/insights/DashboardInsights";
import PerformanceDashboard from "@/app/dashboard/performance/PerformanceDashboard";

export const dashboardRoutes: RouteObject[] = [
  { path: "/dashboard", element: <DashboardPage /> },
  { path: "/dashboard/startup", element: <StartupDashboard /> },
  { path: "/dashboard/insights", element: <DashboardInsights /> },
  { path: "/dashboard/performance", element: <PerformanceDashboard /> },
  { path: "/dashboard/kpi", element: <KpiDashboard /> },
  { path: "/dashboard/team-activity", element: <TeamActivityDashboard /> },
  { path: "/dashboard/incidents", element: <IncidentsDashboard /> },
  { path: "/dashboard/alerts", element: <AlertsDashboard /> },
];
