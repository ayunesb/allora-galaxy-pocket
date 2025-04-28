
import React from 'react';
import { RouteObject } from 'react-router-dom';
import DashboardPage from "@/app/dashboard/page";
import { StartupDashboard } from "@/app/startup/StartupDashboard";
import KpiDashboard from "@/app/insights/kpis/page";
import TeamActivityDashboard from "@/app/dashboard/team-activity/TeamActivityDashboard";
import IncidentsDashboard from "@/app/dashboard/incidents/page";
import { AlertsDashboard } from "@/app/dashboard/alerts/AlertsDashboard"; // Import as named export
import AlertsPage from "@/app/dashboard/alerts/page"; // Use the page component that wraps AlertsDashboard
import DashboardInsights from "@/app/dashboard/insights/DashboardInsights";
import PerformanceDashboard from "@/app/dashboard/performance/PerformanceDashboard";

// Default metrics for PerformanceDashboard
const defaultMetrics = [
  { name: "Conversions", value: 320 },
  { name: "Click Rate", value: "4.2%" },
  { name: "Response Time", value: "2.3s" }
];

export const dashboardRoutes: RouteObject[] = [
  { path: "/dashboard", element: <DashboardPage /> },
  { path: "/dashboard/startup", element: <StartupDashboard /> },
  { path: "/dashboard/insights", element: <DashboardInsights /> },
  { path: "/dashboard/performance", element: <PerformanceDashboard metrics={defaultMetrics} /> },
  { path: "/dashboard/kpi", element: <KpiDashboard /> },
  { path: "/insights/kpis", element: <KpiDashboard /> }, // Added new route
  { path: "/dashboard/team-activity", element: <TeamActivityDashboard /> },
  { path: "/dashboard/incidents", element: <IncidentsDashboard /> },
  { path: "/dashboard/alerts", element: <AlertsPage /> },
];
