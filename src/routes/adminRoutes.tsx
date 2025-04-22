import React from 'react';
import { RouteObject } from 'react-router-dom';
import AdminOnly from "@/guards/AdminOnly";
import SettingsPanel from "@/app/admin/settings/SettingsPanel";
import SeedToolsPanel from "@/app/admin/seed-tools/SeedToolsPanel";
import PluginsDashboard from "@/app/admin/plugins/PluginsDashboard";
import PluginReviewPanel from "@/app/admin/plugins/review/page";
import BillingPanel from "@/app/admin/billing/BillingPanel";
import AnalyticsDashboard from "@/app/admin/analytics/AnalyticsDashboard";
import InviteUserForm from "@/app/admin/invite/InviteUserForm";
import PluginEarningsPage from "@/app/admin/plugins/earnings/page";
import AdminSettingsPage from "@/pages/admin/settings/page";

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
    path: "/admin/plugins/review", 
    element: <AdminOnly><PluginReviewPanel /></AdminOnly> 
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
  },
  { 
    path: "/admin/plugins/earnings", 
    element: <AdminOnly><PluginEarningsPage /></AdminOnly> 
  },
  { 
    path: "/admin/settings", 
    element: <AdminOnly><AdminSettingsPage /></AdminOnly> 
  }
];
