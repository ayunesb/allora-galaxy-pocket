
import React from 'react';
import { RouteObject } from 'react-router-dom';
import SystemHealthDashboard from "@/app/admin/SystemHealthDashboard";
import SecurityDashboard from "@/app/admin/security-audit/SecurityDashboard";
import RlsAuditReport from "@/app/admin/security-audit/RlsAuditReport";
import SystemRepairLauncher from "@/app/SystemRepairLauncher";
import LaunchPage from "@/app/launch/LaunchPage";

export const adminRoutes: RouteObject[] = [
  { path: "/admin/system-health", element: <SystemHealthDashboard /> },
  { path: "/admin/security-audit", element: <SecurityDashboard /> },
  { path: "/admin/rls-audit", element: <RlsAuditReport /> },
  { path: "/admin/system-repair-launcher", element: <SystemRepairLauncher /> },
  { path: "/system-repair", element: <SystemRepairLauncher /> },
  { path: "/launch", element: <LaunchPage /> }
];
