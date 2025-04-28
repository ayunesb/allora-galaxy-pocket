
import React from 'react';
import { RouteObject } from 'react-router-dom';
import WorkspacePage from './page';
import WorkspaceEnvironmentPage from './environment/page';
import WorkspaceUsersPage from './users/page';
import WorkspaceSettingsPage from './settings/page';
import { WorkspaceErrorBoundary } from './components/WorkspaceErrorBoundary';

// Wrap all workspace routes in error boundary
const withErrorBoundary = (Component: React.ComponentType) => {
  return (
    <WorkspaceErrorBoundary>
      <Component />
    </WorkspaceErrorBoundary>
  );
};

export const workspaceRoutes: RouteObject[] = [
  { path: "/workspace", element: withErrorBoundary(WorkspacePage) },
  { path: "/workspace/environment", element: withErrorBoundary(WorkspaceEnvironmentPage) },
  { path: "/workspace/users", element: withErrorBoundary(WorkspaceUsersPage) },
  { path: "/workspace/settings", element: withErrorBoundary(WorkspaceSettingsPage) },
];
