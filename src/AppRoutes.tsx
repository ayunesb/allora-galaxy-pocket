
import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import Layout from '@/components/Layout';
import RequireAuth from "@/guards/RequireAuth";

// Routes
import { publicRoutes } from '@/routes/publicRoutes';
import { appRoutes } from '@/routes/appRoutes';
import { dashboardRoutes } from '@/routes/dashboardRoutes';
import { adminRoutes } from '@/routes/adminRoutes';
import { pluginRoutes } from '@/routes/pluginRoutes';

// Auth Context Provider
import { AuthProvider } from '@/hooks/useAuth';
import { TenantProvider } from '@/hooks/useTenant';
import { Toaster } from "@/components/ui/sonner";

// Create a browser router with all routes
const router = createBrowserRouter([
  // Public routes (no auth required)
  ...publicRoutes,
  
  // Protected routes (requires authentication)
  {
    element: (
      <AuthProvider>
        <TenantProvider>
          <RequireAuth>
            <Layout>
              <Outlet />
            </Layout>
          </RequireAuth>
        </TenantProvider>
      </AuthProvider>
    ),
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
