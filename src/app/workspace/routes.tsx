
import React from 'react';
import { RouteObject } from 'react-router-dom';
import WorkspacePage from './page';
import WorkspaceEnvironmentPage from './environment/page';

export const workspaceRoutes: RouteObject[] = [
  { path: "/workspace", element: <WorkspacePage /> },
  { path: "/workspace/environment", element: <WorkspaceEnvironmentPage /> },
];
