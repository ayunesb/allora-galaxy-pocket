import React from 'react';
import AdminDashboardPage from '@/app/admin/dashboard/page';
import SystemMonitoringPage from '@/app/admin/monitoring/page';
import UserManagementPage from '@/app/admin/user-management/page';
import SettingsPage from '@/app/admin/settings/page';
import AdminLogsPage from '@/app/admin/logs/page';
import RlsAuditReport from "@/app/admin/security-audit/RlsAuditReport";
import SecurityDashboard from "@/app/admin/security-audit/SecurityDashboard";

export const adminRoutes = [
  {
    path: '/admin',
    name: 'Dashboard',
    component: <AdminDashboardPage />,
  },
  {
    path: '/admin/monitoring',
    name: 'System Monitoring',
    component: <SystemMonitoringPage />,
  },
  {
    path: '/admin/user-management',
    name: 'User Management',
    component: <UserManagementPage />,
  },
  {
    path: '/admin/logs',
    name: 'System Logs',
    component: <AdminLogsPage />,
  },
  {
    path: '/admin/security-audit',
    name: 'Security Audit',
    component: <SecurityDashboard />,
  },
  {
    path: '/admin/rls-audit',
    name: 'RLS Audit',
    component: <RlsAuditReport />,
  },
  {
    path: '/admin/settings',
    name: 'Settings',
    component: <SettingsPage />,
  },
];
