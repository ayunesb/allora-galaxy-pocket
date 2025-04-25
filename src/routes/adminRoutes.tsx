
import React from 'react';
import { RouteObject } from 'react-router-dom';
import AdminDashboard from '@/app/admin/dashboard/page';
import AdminAnalytics from '@/app/admin/analytics/page';
import AdminSettings from '@/app/admin/settings/page';
import AdminUsersPage from '@/app/admin/users/page';
import AdminPluginsPage from '@/app/admin/plugins/gallery/page';
import AdminSecurityAuditPage from '@/app/admin/security-audit/page';
import AdminTenantsPage from '@/app/admin/tenants/page';
import AdminMonitoringPage from '@/app/admin/monitoring/page';
import AdminBillingPanel from '@/app/admin/billing/BillingPanel';
import AdminLogsPage from '@/app/admin/logs/page';
import RoleGuard from '@/guards/RoleGuard';

export const adminRoutes: RouteObject[] = [
  { 
    path: '/admin', 
    element: (
      <RoleGuard allowedRoles={['admin', 'super_admin']}>
        <AdminDashboard />
      </RoleGuard>
    ) 
  },
  { 
    path: '/admin/dashboard', 
    element: (
      <RoleGuard allowedRoles={['admin', 'super_admin']}>
        <AdminDashboard />
      </RoleGuard>
    ) 
  },
  { 
    path: '/admin/analytics', 
    element: (
      <RoleGuard allowedRoles={['admin', 'super_admin']}>
        <AdminAnalytics />
      </RoleGuard>
    ) 
  },
  { 
    path: '/admin/settings', 
    element: (
      <RoleGuard allowedRoles={['admin', 'super_admin']}>
        <AdminSettings />
      </RoleGuard>
    ) 
  },
  { 
    path: '/admin/users', 
    element: (
      <RoleGuard allowedRoles={['admin', 'super_admin']}>
        <AdminUsersPage />
      </RoleGuard>
    ) 
  },
  { 
    path: '/admin/plugins', 
    element: (
      <RoleGuard allowedRoles={['admin', 'super_admin']}>
        <AdminPluginsPage />
      </RoleGuard>
    ) 
  },
  { 
    path: '/admin/security-audit', 
    element: (
      <RoleGuard allowedRoles={['admin', 'super_admin']}>
        <AdminSecurityAuditPage />
      </RoleGuard>
    ) 
  },
  { 
    path: '/admin/tenants', 
    element: (
      <RoleGuard allowedRoles={['admin', 'super_admin']}>
        <AdminTenantsPage />
      </RoleGuard>
    ) 
  },
  { 
    path: '/admin/monitoring', 
    element: (
      <RoleGuard allowedRoles={['admin', 'super_admin']}>
        <AdminMonitoringPage />
      </RoleGuard>
    ) 
  },
  { 
    path: '/admin/billing', 
    element: (
      <RoleGuard allowedRoles={['admin', 'super_admin', 'billing_admin']}>
        <AdminBillingPanel />
      </RoleGuard>
    ) 
  },
  { 
    path: '/admin/logs', 
    element: (
      <RoleGuard allowedRoles={['admin', 'super_admin']}>
        <AdminLogsPage />
      </RoleGuard>
    ) 
  }
];
