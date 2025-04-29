
import React from 'react';
import { RouteObject, Navigate, Outlet } from 'react-router-dom';
import { publicRoutes } from './routes/publicRoutes';
import { appRoutes } from './routes/appRoutes';
import { dashboardRoutes } from './routes/dashboardRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { pluginRoutes } from './routes/pluginRoutes';
import { billingRoutes } from './routes/billingRoutes';
import { workspaceRoutes } from '@/app/workspace/routes';
import { systemRoutes } from '@/app/system/routes';
import { systemRepairRoutes } from '@/app/admin/system-repair/routes';
import RequireAuth from '@/guards/RequireAuth';
import Layout from '@/components/Layout';
import NotFound from '@/pages/NotFound';
import { SecurityProvider } from '@/providers/SecurityProvider';
import { VerificationProvider } from '@/providers/VerificationProvider';
import ErrorPage from '@/ErrorPage';
import { TransitionErrorHandler } from '@/components/TransitionErrorHandler';

// Define the route structure
const routes: RouteObject[] = [
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
        <Layout>
          <React.Suspense fallback={<div>Loading...</div>}>
            <TransitionErrorHandler>
              <SecurityProvider>
                <VerificationProvider>
                  <Outlet />
                </VerificationProvider>
              </SecurityProvider>
            </TransitionErrorHandler>
          </React.Suspense>
        </Layout>
      </RequireAuth>
    ),
    errorElement: <ErrorPage />,
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
      ...systemRoutes,
      ...systemRepairRoutes,
      
      // Catch-all route - this should be LAST
      { path: "*", element: <NotFound /> }
    ],
  },
  
  // Final catch-all route for the entire application
  { path: "*", element: <NotFound /> }
];

export default routes;
