
import React from 'react';
import { RouteObject } from 'react-router-dom';
import AdminDashboardPage from '@/app/admin/dashboard/page';
import SystemMonitoringPage from '@/app/admin/monitoring/page';
import UserManagementPage from '@/app/admin/user-management/page';
import SettingsPage from '@/app/admin/settings/page';
import AdminLogsPage from '@/app/admin/logs/page';
import RlsAuditReport from "@/app/admin/security-audit/RlsAuditReport";
import SecurityDashboard from "@/app/admin/security-audit/SecurityDashboard";
import SecurityAuditPage from '@/app/admin/security-audit/page';

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
    element: <SecurityAuditPage />,
  },
  {
    path: '/admin/security-audit/rls',
    element: <RlsAuditReport />,
  },
  {
    path: '/admin/security-audit/dashboard',
    element: <SecurityDashboard />,
  },
  {
    path: '/admin/settings',
    element: <SettingsPage />,
  }
];
