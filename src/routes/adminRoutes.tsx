
import React from 'react';
import { RouteObject } from 'react-router-dom';
import AdminDashboardPage from '@/app/admin/dashboard/page';
import SystemMonitoringPage from '@/app/admin/monitoring/page';
import UserManagementPage from '@/app/admin/user-management/page';
import SettingsPage from '@/app/admin/settings/page';
import AdminLogsPage from '@/app/admin/logs/page';
import RlsAuditReport from "@/app/admin/security-audit/RlsAuditReport";
import SecurityDashboard from "@/app/admin/security-audit/SecurityDashboard";
import BillingPanel from '@/app/admin/billing/BillingPanel';
import AnalyticsDashboard from '@/app/admin/analytics/page';
import SecurityAuditPage from '@/app/admin/security-audit/page';
import AIDecisionsPage from '@/app/admin/ai-decisions/page';

export const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: <AdminDashboardPage />,
  },
  {
    path: '/admin/monitoring',
    element: <SystemMonitoringPage />,
  },
  {
    path: '/admin/user-management',
    element: <UserManagementPage />,
  },
  {
    path: '/admin/logs',
    element: <AdminLogsPage />,
  },
  {
    path: '/admin/security-audit',
    element: <SecurityDashboard />,
  },
  {
    path: '/admin/rls-audit',
    element: <RlsAuditReport />,
  },
  {
    path: '/admin/settings',
    element: <SettingsPage />,
  },
  {
    path: 'security-audit',
    element: <SecurityAuditPage />
  },
  {
    path: 'logs',
    element: <AdminLogsPage />
  }
];
