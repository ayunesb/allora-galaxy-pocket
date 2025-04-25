
import React from 'react';
import { RouteObject } from 'react-router-dom';
import AdminDashboard from '@/app/admin/dashboard/page';
import SecurityAudit from '@/app/admin/security-audit/page';
import RlsAuditReport from '@/app/admin/security-audit/RlsAuditReport';
import AdminLogsPage from '@/app/admin/logs/page';
import JourneyVerificationPage from '@/app/admin/testing/journey-verification';

// Define admin routes
export const adminRoutes: RouteObject[] = [
  { path: "/admin", element: <AdminDashboard /> },
  { path: "/admin/dashboard", element: <AdminDashboard /> },
  { path: "/admin/security-audit", element: <SecurityAudit /> },
  { path: "/admin/security-audit/rls", element: <RlsAuditReport /> },
  { path: "/admin/logs", element: <AdminLogsPage /> },
  { path: "/admin/testing/journey", element: <JourneyVerificationPage /> },
];
