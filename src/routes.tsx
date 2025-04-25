
import React from 'react';
import { RouteObject, Navigate, Outlet } from 'react-router-dom';
import { publicRoutes } from './routes/publicRoutes';
import { appRoutes } from './routes/appRoutes';
import { dashboardRoutes } from './routes/dashboardRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { pluginRoutes } from './routes/pluginRoutes';
import { billingRoutes } from './routes/billingRoutes';
import { workspaceRoutes } from './app/workspace/routes';
import RequireAuth from '@/guards/RequireAuth';
import Layout from '@/components/Layout';
import NotFound from '@/pages/NotFound';
import { SecurityProvider } from '@/providers/SecurityProvider';
import { VerificationProvider } from '@/providers/VerificationProvider';

// Define the route structure
const routes: RouteObject[] = [
  // Public routes (no auth required)
  ...publicRoutes,
  
  // Protected routes (require authentication)
  {
    element: (
      <RequireAuth>
        <SecurityProvider>
          <VerificationProvider>
            <Layout>
              <Outlet />
            </Layout>
          </VerificationProvider>
        </SecurityProvider>
      </RequireAuth>
    ),
    children: [
      // Redirect from root to dashboard
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      
      // App sections
      ...dashboardRoutes,
      ...appRoutes,
      ...adminRoutes,
      ...pluginRoutes, 
      ...billingRoutes,
      ...workspaceRoutes,
      
      // Catch-all route - this should be LAST
      { path: "*", element: <NotFound /> }
    ],
  }
];

export default routes;
