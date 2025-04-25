
import React from 'react';
import { RouteObject } from 'react-router-dom';
import WorkspacePage from './page';
import WorkspaceEnvironmentPage from './environment/page';
import WorkspaceUsersPage from './users/page';

export const workspaceRoutes: RouteObject[] = [
  { path: "/workspace", element: <WorkspacePage /> },
  { path: "/workspace/environment", element: <WorkspaceEnvironmentPage /> },
  { path: "/workspace/users", element: <WorkspaceUsersPage /> },
];
