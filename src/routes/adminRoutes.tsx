
import React from 'react';
import { RouteObject } from 'react-router-dom';
import AdminDashboard from '@/components/admin/AdminDashboard';
import RlsAuditReport from '@/app/admin/security-audit/RlsAuditReport';
import SecurityDashboard from '@/app/admin/security-audit/SecurityDashboard';

// Create a placeholder for AdminLogsPage since the original import is missing
const AdminLogsPage = () => <div className="p-8">Admin Logs Page</div>;

export const adminRoutes: RouteObject[] = [
  { path: "/admin", element: <AdminDashboard /> },
  { path: "/admin/logs", element: <AdminLogsPage /> },
  { path: "/admin/security-audit", element: <RlsAuditReport /> },
  { path: "/admin/security-dashboard", element: <SecurityDashboard /> },
];
