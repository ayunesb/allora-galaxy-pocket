
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

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      {publicRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      
      {/* Protected routes */}
      <Route element={<AuthenticatedLayout />}>
        {dashboardRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={
            <ErrorBoundary>
              {route.element}
            </ErrorBoundary>
          } />
        ))}
        
        {adminRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        
        {appRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={
            <ErrorBoundary>
              {route.element}
            </ErrorBoundary>
          } />
        ))}

        {/* Plugin routes with Debug Error Boundary */}
        {pluginRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={
            <DebugErrorBoundary>
              {route.element}
            </DebugErrorBoundary>
          } />
        ))}
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
