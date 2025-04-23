
import React from 'react';
import { RouteObject, Navigate, Outlet } from 'react-router-dom';
import { publicRoutes } from './routes/publicRoutes';
import { appRoutes } from './routes/appRoutes';
import { dashboardRoutes } from './routes/dashboardRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { pluginRoutes } from './routes/pluginRoutes';
import { billingRoutes } from './routes/billingRoutes';
import RequireAuth from '@/guards/RequireAuth';
import Layout from '@/components/Layout';
import NotFound from '@/pages/NotFound';
import { SecurityProvider } from '@/providers/SecurityProvider';

// Define the route structure
const routes: RouteObject[] = [
  // Public routes (no auth required)
  ...publicRoutes,
  
  // Protected routes (require authentication)
  {
    element: (
      <RequireAuth>
        <SecurityProvider>
          <Layout>
            <Outlet />
          </Layout>
        </SecurityProvider>
      </RequireAuth>
    ),
    errorElement: <NotFound />,
    children: [
      // Redirect from root to dashboard
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      
      // App sections
      ...dashboardRoutes,
      ...appRoutes,
      ...adminRoutes,
      ...pluginRoutes, 
      ...billingRoutes,
      
      // Catch-all route
      { path: "*", element: <NotFound /> }
    ],
  }
];

export default routes;
