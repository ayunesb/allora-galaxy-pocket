
import React from 'react';
import { RouteObject } from 'react-router-dom';
import AdminOnly from "@/guards/AdminOnly";
import SettingsPanel from "@/app/admin/settings/SettingsPanel";
import SeedToolsPanel from "@/app/admin/seed-tools/SeedToolsPanel";
import PluginsDashboard from "@/app/admin/plugins/PluginsDashboard";
import BillingPanel from "@/app/admin/billing/BillingPanel";
import AnalyticsDashboard from "@/app/admin/analytics/AnalyticsDashboard";
import InviteUserForm from "@/app/admin/invite/InviteUserForm";

export const adminRoutes: RouteObject[] = [
  { 
    path: "/admin/settings", 
    element: <AdminOnly><SettingsPanel /></AdminOnly> 
  },
  { 
    path: "/admin/seed-tools", 
    element: <AdminOnly><SeedToolsPanel /></AdminOnly> 
  },
  { 
    path: "/admin/plugins", 
    element: <AdminOnly><PluginsDashboard /></AdminOnly> 
  },
  { 
    path: "/admin/billing", 
    element: <AdminOnly><BillingPanel /></AdminOnly> 
  },
  { 
    path: "/admin/analytics", 
    element: <AdminOnly><AnalyticsDashboard /></AdminOnly> 
  },
  { 
    path: "/admin/invite", 
    element: <AdminOnly><InviteUserForm /></AdminOnly> 
  }
];
