
import React from 'react';
import { RouteObject } from 'react-router-dom';
import { publicRoutes } from './publicRoutes';
import { appRoutes } from './appRoutes';
import { dashboardRoutes } from './dashboardRoutes';
import { adminRoutes } from './adminRoutes';
import { pluginRoutes } from './pluginRoutes';
import { billingRoutes } from './billingRoutes';
import { workspaceRoutes } from '@/app/workspace/routes';
import { systemRoutes } from '@/app/system/routes';
import ErrorPage from '@/ErrorPage';
import RequireAuth from '@/guards/RequireAuth';
import Layout from '@/components/Layout';
import NotFound from '@/pages/NotFound';
import { SecurityProvider } from '@/providers/SecurityProvider';
import { VerificationProvider } from '@/providers/VerificationProvider';

// Define the route structure
export const baseRoutes: RouteObject[] = [
  // Public routes (no auth required)
  ...publicRoutes,
  
  // Error boundary route
  { 
    path: "/error", 
    element: <ErrorPage /> 
  },
  
  // Protected routes (require authentication)
  {
    element: (
      <RequireAuth>
        <SecurityProvider>
          <VerificationProvider>
            <Layout>
              <React.Suspense fallback={<div>Loading...</div>}>
                <React.Outlet />
              </React.Suspense>
            </Layout>
          </VerificationProvider>
        </SecurityProvider>
      </RequireAuth>
    ),
    errorElement: <ErrorPage />,
    children: [
      // Redirect from root to dashboard
      { path: "/", element: <React.Navigate to="/dashboard" replace /> },
      
      // App sections
      ...dashboardRoutes,
      ...appRoutes,
      ...adminRoutes,
      ...pluginRoutes, 
      ...billingRoutes,
      ...workspaceRoutes,
      ...systemRoutes,
      
      // Catch-all route - this should be LAST
      { path: "*", element: <NotFound /> }
    ],
  },
  
  // Final catch-all route for the entire application
  { path: "*", element: <NotFound /> }
];
