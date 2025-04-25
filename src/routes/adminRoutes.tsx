
import React from 'react';
import { RouteObject } from 'react-router-dom';
import AdminDashboard from '@/app/admin/dashboard/page';
import AdminAnalytics from '@/app/admin/analytics/page';
import AdminPlugins from '@/app/admin/plugins/PluginsDashboard';
import AdminSettings from '@/app/admin/settings/page';
import AdminAIDecisions from '@/app/admin/ai-decisions/page';
import AdminTenants from '@/app/admin/tenants/page';
import AdminMonitoring from '@/app/admin/monitoring/page';
import AdminLogsPage from '@/app/admin/logs/page';
import AdminInvite from '@/app/admin/invite/page';
import AdminUserManagement from '@/app/admin/user-management/page';
import AdminSecurityAudit from '@/app/admin/security-audit/page';
import AdminWeeklyAIReport from '@/app/admin/ai-decisions/weekly/page';
import AdminCampaignPerformance from '@/app/admin/campaign-performance/page';
import AdminPluginGallery from '@/app/admin/plugins/gallery/page';
import AdminPluginEarnings from '@/app/admin/plugins/earnings/page';
import AdminPluginReview from '@/app/admin/plugins/review/page';
import AdminBilling from '@/app/admin/billing/BillingPanel';

export const adminRoutes: RouteObject[] = [
  { path: '/admin', element: <AdminDashboard /> },
  { path: '/admin/dashboard', element: <AdminDashboard /> },
  { path: '/admin/analytics', element: <AdminAnalytics /> },
  { path: '/admin/plugins', element: <AdminPlugins /> },
  { path: '/admin/plugins/gallery', element: <AdminPluginGallery /> },
  { path: '/admin/plugins/earnings', element: <AdminPluginEarnings /> },
  { path: '/admin/plugins/review', element: <AdminPluginReview /> },
  { path: '/admin/settings', element: <AdminSettings /> },
  { path: '/admin/ai-decisions', element: <AdminAIDecisions /> },
  { path: '/admin/ai-decisions/weekly', element: <AdminWeeklyAIReport /> },
  { path: '/admin/tenants', element: <AdminTenants /> },
  { path: '/admin/monitoring', element: <AdminMonitoring /> },
  { path: '/admin/logs', element: <AdminLogsPage /> },
  { path: '/admin/invite', element: <AdminInvite /> },
  { path: '/admin/users', element: <AdminUserManagement /> },
  { path: '/admin/security-audit', element: <AdminSecurityAudit /> },
  { path: '/admin/campaign-performance', element: <AdminCampaignPerformance /> },
  { path: '/admin/billing', element: <AdminBilling /> },
];
