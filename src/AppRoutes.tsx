
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
  
  return (
    <ErrorBoundary>
      <RouteDebugger />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={
          <DebugErrorBoundary>
            <Navigate to="/dashboard" replace />
          </DebugErrorBoundary>
        } />
        
        {publicRoutes.map((route) => (
          <Route 
            key={route.path} 
            path={route.path} 
            element={
              <DebugErrorBoundary>
                {route.element}
              </DebugErrorBoundary>
            } 
          />
        ))}
        
        {/* Protected routes */}
        <Route element={
          <DebugErrorBoundary>
            <AuthenticatedLayout />
          </DebugErrorBoundary>
        }>
          {/* Dashboard routes */}
          {dashboardRoutes.map((route) => (
            <Route 
              key={route.path} 
              path={route.path} 
              element={
                <DebugErrorBoundary>
                  {route.element}
                </DebugErrorBoundary>
              } 
            />
          ))}
          
          {/* Admin routes */}
          {adminRoutes.map((route) => (
            <Route 
              key={route.path} 
              path={route.path} 
              element={
                <DebugErrorBoundary>
                  {route.element}
                </DebugErrorBoundary>
              } 
            />
          ))}
          
          {/* App routes */}
          {appRoutes.map((route) => (
            <Route 
              key={route.path} 
              path={route.path} 
              element={
                <DebugErrorBoundary>
                  {route.element}
                </DebugErrorBoundary>
              } 
            />
          ))}

          {/* Plugin routes */}
          {pluginRoutes.map((route) => (
            <Route 
              key={route.path} 
              path={route.path} 
              element={
                <DebugErrorBoundary>
                  {route.element}
                </DebugErrorBoundary>
              } 
            />
          ))}
        </Route>
        
        <Route path="*" element={
          <DebugErrorBoundary>
            <NotFound />
          </DebugErrorBoundary>
        } />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRoutes;
