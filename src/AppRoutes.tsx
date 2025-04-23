
import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import Layout from '@/components/Layout';
import RequireAuth from "@/guards/RequireAuth";
import NotFound from '@/pages/NotFound';

// Routes
import { publicRoutes } from '@/routes/publicRoutes';
import { appRoutes } from '@/routes/appRoutes';
import { dashboardRoutes } from '@/routes/dashboardRoutes';
import { adminRoutes } from '@/routes/adminRoutes';
import { pluginRoutes } from '@/routes/pluginRoutes';
import { billingRoutes } from '@/routes/billingRoutes';

// Auth Context Provider
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from "@/components/ui/sonner";
import { EnhancedErrorBoundary } from '@/components/EnhancedErrorBoundary';
import { RouteDebugger } from '@/components/RouteDebugger';

// Enable this for debugging routes in development
const showRouteDebugger = process.env.NODE_ENV === 'development' && false;

// Create a browser router with all routes
const router = createBrowserRouter([
  // Public routes with AuthProvider (no auth required, but auth context is available)
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    errorElement: <NotFound />,
    children: [
      ...publicRoutes,
    ],
  },
  
  // Protected routes (requires authentication)
  {
    element: (
      <AuthProvider>
        <RequireAuth>
          <EnhancedErrorBoundary>
            <Layout>
              {showRouteDebugger && <RouteDebugger />}
              <Outlet />
            </Layout>
          </EnhancedErrorBoundary>
        </RequireAuth>
      </AuthProvider>
    ),
    errorElement: <NotFound />,
    children: [
      // Redirect from root to dashboard for authenticated users
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      
      // Dashboard routes
      ...dashboardRoutes,
      
      // App routes (all other app features)
      ...appRoutes,
      
      // Admin routes (admin-specific features)
      ...adminRoutes,
      
      // Plugin routes
      ...pluginRoutes,
      
      // Billing routes
      ...billingRoutes,
      
      // Catch-all route - must be last
      { path: "*", element: <NotFound /> }
    ],
  },
]);

export default function AppRoutes() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}
