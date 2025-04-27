
import React from 'react';
import { RouteObject } from 'react-router-dom';
import RlsAuditReport from '@/app/admin/security-audit/RlsAuditReport';
import SecurityDashboard from '@/app/admin/security-audit/SecurityDashboard';
import VerificationPage from '@/app/admin/verification/page';
import ProductionReadinessPage from '@/app/admin/production-readiness/page';
import SystemStatusPage from '@/app/admin/system-status/page';

export const adminRoutes: RouteObject[] = [
  { 
    path: '/admin/security-audit/report',
    element: <RlsAuditReport /> 
  },
  { 
    path: '/admin/security-audit/dashboard', 
    element: <SecurityDashboard /> 
  },
  {
    path: '/admin/verification',
    element: <VerificationPage />
  },
  {
    path: '/admin/production-readiness',
    element: <ProductionReadinessPage />
  },
  {
    path: '/admin/system-status',
    element: <SystemStatusPage />
  }
];
