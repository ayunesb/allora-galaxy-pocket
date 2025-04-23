
import React from 'react';
import { RouteObject } from 'react-router-dom';
import CollaborationPage from "@/app/admin/agents/collaboration/page";
import PluginEarningsPage from "@/app/admin/plugins/earnings/page";
import InviteUsersPage from "@/app/admin/invite/page";
import PluginReviewPage from "@/app/admin/plugins/review/page";
import AddPluginPage from "@/app/admin/plugins/gallery/page";
import AgentMemoryConsole from "@/app/admin/agents/memory/page";
import RoleChangeRequestsPage from "@/app/admin/users/role-requests/page";
import UserManagementPage from "@/app/admin/users/page";
import WeeklySummaryFeed from "@/app/admin/ai-decisions/weekly/page";
import AdminLogsPage from "@/app/admin/logs/page";

export const adminRoutes: RouteObject[] = [
  { path: "/admin/agents/collaboration", element: <CollaborationPage /> },
  { path: "/admin/plugins/earnings", element: <PluginEarningsPage /> },
  { path: "/admin/settings", element: <div>Admin Settings</div> },
  { path: "/admin/invite", element: <InviteUsersPage /> },
  { path: "/admin/plugins/review", element: <PluginReviewPage /> },
  { path: "/admin/plugins/gallery", element: <AddPluginPage /> },
  { path: "/admin/agents/memory", element: <AgentMemoryConsole /> },
  { path: "/admin/users", element: <UserManagementPage /> },
  { path: "/admin/users/role-requests", element: <RoleChangeRequestsPage /> },
  { path: "/admin/integrations", element: <div>Admin Integrations</div> },
  { path: "/admin/logs", element: <AdminLogsPage /> },
  { path: "/admin/ai-decisions/weekly", element: <WeeklySummaryFeed /> }
];
