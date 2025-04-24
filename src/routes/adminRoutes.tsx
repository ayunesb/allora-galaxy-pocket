
import React from "react";
import { RouteObject } from "react-router-dom";

// Import admin pages
import SecurityAuditPage from "@/app/admin/security-audit/page";
import SecurityDashboard from "@/app/admin/security-audit/SecurityDashboard";
import RlsAuditReport from "@/app/admin/security-audit/RlsAuditReport";
import SystemHealthCheck from "@/components/SystemHealthCheck";

export const adminRoutes: RouteObject[] = [
  { path: "/admin/security-audit", element: <SecurityAuditPage /> },
  { path: "/admin/security-dashboard", element: <SecurityDashboard /> },
  { path: "/admin/rls-audit", element: <RlsAuditReport /> },
  { path: "/admin/system-health", element: <SystemHealthCheck /> },
  { path: "/admin/logs", element: <div>Admin Logs</div> }
];
