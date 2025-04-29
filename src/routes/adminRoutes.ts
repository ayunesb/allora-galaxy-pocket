
import { RouteObject } from "react-router-dom";
import SystemHealthDashboard from "@/app/admin/SystemHealthDashboard";
import RlsAuditReport from "@/app/admin/security-audit/RlsAuditReport";
import SystemMonitoringPage from "@/app/admin/monitoring/page";

export const adminRoutes: RouteObject[] = [
  {
    path: "/admin/system-health",
    element: <SystemHealthDashboard />
  },
  {
    path: "/admin/security-audit",
    element: <RlsAuditReport />
  },
  {
    path: "/admin/monitoring",
    element: <SystemMonitoringPage />
  }
];
