
import React from 'react';
import { RouteObject } from 'react-router-dom';
import CollaborationPage from "@/app/admin/agents/collaboration/page";
import PluginEarningsPage from "@/app/admin/plugins/earnings/page";

export const adminRoutes: RouteObject[] = [
  { path: "/admin/agents/collaboration", element: <CollaborationPage /> },
  { path: "/admin/plugins/earnings", element: <PluginEarningsPage /> },
  { path: "/admin/settings", element: <div>Admin Settings</div> },
  { path: "/admin/invite", element: <div>Invite Users</div> },
  { path: "/admin/plugins/review", element: <div>Plugin Review</div> }
];
