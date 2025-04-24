
import React from "react";
import { RouteObject } from "react-router-dom";

// Import admin pages
import SecurityAuditPage from "@/app/admin/security-audit/page";
import SecurityDashboard from "@/app/admin/security-audit/SecurityDashboard";
import RlsAuditReport from "@/app/admin/security-audit/RlsAuditReport";
import SystemHealthCheck from "@/components/SystemHealthCheck";
import CampaignPerformancePage from "@/app/admin/campaign-performance/page";
import FeedbackLoopDashboard from "@/app/admin/feedback-loop/page";
import AdminDashboardPage from "@/app/admin/dashboard/page";
import AnalyticsPage from "@/app/admin/analytics/page";

export const adminRoutes: RouteObject[] = [
  { path: "/admin/dashboard", element: <AdminDashboardPage /> },
  { path: "/admin/security-audit", element: <SecurityAuditPage /> },
  { path: "/admin/security-dashboard", element: <SecurityDashboard /> },
  { path: "/admin/rls-audit", element: <RlsAuditReport /> },
  { path: "/admin/system-health", element: <SystemHealthCheck /> },
  { path: "/admin/campaign-performance", element: <CampaignPerformancePage /> },
  { path: "/admin/feedback-loop", element: <FeedbackLoopDashboard /> },
  { path: "/admin/analytics", element: <AnalyticsPage /> }
];
