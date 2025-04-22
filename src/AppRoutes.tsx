
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import AuthenticatedLayout from "@/app/layouts/AuthenticatedLayout";
import NotFound from "@/pages/NotFound";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { publicRoutes } from './routes/publicRoutes';
import { dashboardRoutes } from './routes/dashboardRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { appRoutes } from './routes/appRoutes';
import { pluginRoutes } from './routes/pluginRoutes';
import { DebugErrorBoundary } from '@/components/DebugErrorBoundary';
import { RouteDebugger } from '@/components/RouteDebugger';

const AppRoutes = () => {
  // Log when routes are being rendered
  console.log("Rendering AppRoutes");
  
  // Helper function to wrap routes with appropriate error boundary
  const wrapWithErrorBoundary = (element: React.ReactNode, isDebug = false) => {
    const ErrorWrapper = isDebug ? DebugErrorBoundary : ErrorBoundary;
    return (
      <ErrorWrapper key={Math.random().toString(36).substring(7)}>
        {element}
      </ErrorWrapper>
    );
  };
  
  return (
    <ErrorBoundary>
      <RouteDebugger />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={wrapWithErrorBoundary(<Navigate to="/dashboard" replace />)} />
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={wrapWithErrorBoundary(route.element)} />
        ))}
        
        {/* Protected routes */}
        <Route element={wrapWithErrorBoundary(<AuthenticatedLayout />)}>
          {/* Dashboard routes */}
          {dashboardRoutes.map((route) => (
            <Route 
              key={route.path} 
              path={route.path} 
              element={wrapWithErrorBoundary(route.element, true)} 
            />
          ))}
          
          {/* Admin routes with Debug Error Boundary */}
          {adminRoutes.map((route) => (
            <Route 
              key={route.path} 
              path={route.path} 
              element={wrapWithErrorBoundary(route.element, true)} 
            />
          ))}
          
          {/* App routes */}
          {appRoutes.map((route) => (
            <Route 
              key={route.path} 
              path={route.path} 
              element={wrapWithErrorBoundary(route.element, true)} 
            />
          ))}

          {/* Plugin routes with Debug Error Boundary */}
          {pluginRoutes.map((route) => (
            <Route 
              key={route.path} 
              path={route.path} 
              element={wrapWithErrorBoundary(route.element, true)} 
            />
          ))}
        </Route>
        
        <Route path="*" element={wrapWithErrorBoundary(<NotFound />)} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRoutes;
