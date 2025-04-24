
import React from 'react';
import { RouteObject } from 'react-router-dom';
import AdminLogsPage from '@/app/admin/logs/page';
import SecurityAuditPage from "@/app/admin/security-audit/page";
import SecurityDashboard from "@/app/admin/security-audit/SecurityDashboard";
import RlsAuditReport from "@/app/admin/security-audit/RlsAuditReport";
import SystemHealthCheck from "@/components/SystemHealthCheck";
import CampaignPerformancePage from "@/app/admin/campaign-performance/page";
import FeedbackLoopDashboard from "@/app/admin/feedback-loop/page";
import AdminDashboardPage from "@/app/admin/dashboard/page";
import AnalyticsPage from "@/app/admin/analytics/page";
import InviteUsersPage from "@/app/admin/invite/page";
import IntegrationsPage from "@/app/admin/integrations/page";
import AgentMemoryConsole from "@/app/admin/agents/memory/page";
import CollaborationPage from "@/app/admin/agents/collaboration/page";
import AdminSettingsPage from "@/pages/admin/settings/page";
import TenantsManagementPage from '@/app/admin/tenants/page';
import SystemMonitoringPage from '@/app/admin/monitoring/page';

export const adminRoutes: RouteObject[] = [
  { path: "/admin/dashboard", element: <AdminDashboardPage /> },
  { path: "/admin/security-audit", element: <SecurityAuditPage /> },
  { path: "/admin/security-dashboard", element: <SecurityDashboard /> },
  { path: "/admin/rls-audit", element: <RlsAuditReport /> },
  { path: "/admin/system-health", element: <SystemHealthCheck /> },
  { path: "/admin/campaign-performance", element: <CampaignPerformancePage /> },
  { path: "/admin/feedback-loop", element: <FeedbackLoopDashboard /> },
  { path: "/admin/analytics", element: <AnalyticsPage /> },
  { path: "/admin/logs", element: <AdminLogsPage /> },
  { path: "/admin/invite", element: <InviteUsersPage /> },
  { path: "/admin/integrations", element: <IntegrationsPage /> },
  { path: "/admin/agents/memory", element: <AgentMemoryConsole /> },
  { path: "/admin/agents/collaboration", element: <CollaborationPage /> },
  { path: "/admin/settings", element: <AdminSettingsPage /> },
  { path: "/admin/tenants", element: <TenantsManagementPage /> },
  { path: "/admin/monitoring", element: <SystemMonitoringPage /> }
];
