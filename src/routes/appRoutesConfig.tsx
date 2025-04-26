
import React from 'react';
import { RouteObject } from 'react-router-dom';
import ErrorPage from '@/ErrorPage';
import HomePage from '@/app/page';
import DashboardPage from '@/app/dashboard/page';
import NotFound from '@/pages/NotFound';
import StrategyDetail from '@/app/strategy/[id]';

// Use dynamic imports for lazy loading
const OnboardingPage = React.lazy(() => import('@/app/onboarding/OnboardingWizard'));
const VaultPage = React.lazy(() => import('@/app/vault/page'));
const StrategyPage = React.lazy(() => import('@/app/strategy/page'));

// Placeholder components for missing pages
const CampaignsCenter = () => <div className="p-8">Campaigns Center</div>;
const LaunchPage = () => <div className="p-8">Launch Page</div>;
const InsightsKpisPage = () => <div className="p-8">Insights KPIs Page</div>;
const AdminSecurityAuditPage = () => <div className="p-8">Admin Security Audit Page</div>;
const AdminIntegrationsPage = () => <div className="p-8">Admin Integrations Page</div>;
const AdminUsersPage = () => <div className="p-8">Admin Users Page</div>;
const AuthLoginPage = () => <div className="p-8">Login Page</div>;
const AuthRegisterPage = () => <div className="p-8">Register Page</div>;
const AuthForgotPasswordPage = () => <div className="p-8">Forgot Password Page</div>;
const AuthResetPasswordPage = () => <div className="p-8">Reset Password Page</div>;
const WorkspacePage = () => <div className="p-8">Workspace Page</div>;
const PerformancePage = () => <div className="p-8">Performance Page</div>;
const AgentPerformancePage = () => <div className="p-8">Agent Performance Page</div>;
const PluginsSubmitPage = () => <div className="p-8">Plugin Submit Page</div>;
const AdminLogsPage = () => <div className="p-8">Admin Logs Page</div>;

import { systemRoutes } from '@/app/system/routes';

// Base route configuration without App component
export const baseRoutes: RouteObject[] = [
  {
    path: '/',
    element: null, // This will be replaced with App component in App.tsx
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/onboarding',
        element: (
          <React.Suspense fallback={<div className="p-8 flex justify-center items-center">Loading...</div>}>
            <OnboardingPage />
          </React.Suspense>
        ),
      },
      {
        path: '/vault',
        element: (
          <React.Suspense fallback={<div className="p-8 flex justify-center items-center">Loading...</div>}>
            <VaultPage />
          </React.Suspense>
        ),
      },
      {
        path: '/strategy',
        element: (
          <React.Suspense fallback={<div className="p-8 flex justify-center items-center">Loading...</div>}>
            <StrategyPage />
          </React.Suspense>
        ),
      },
      {
        path: '/strategy/:id',
        element: <StrategyDetail />,
      },
      {
        path: '/campaigns/center',
        element: <CampaignsCenter />,
      },
      {
        path: '/launch',
        element: <LaunchPage />,
      },
      {
        path: '/insights/kpis',
        element: <InsightsKpisPage />,
      },
      {
        path: '/admin/security-audit',
        element: <AdminSecurityAuditPage />,
      },
      {
        path: '/admin/integrations',
        element: <AdminIntegrationsPage />,
      },
      {
        path: '/admin/users',
        element: <AdminUsersPage />,
      },
      {
        path: '/admin/logs',
        element: <AdminLogsPage />,
      },
      {
        path: '/auth/login',
        element: <AuthLoginPage />,
      },
      {
        path: '/auth/register',
        element: <AuthRegisterPage />,
      },
      {
        path: '/auth/forgot-password',
        element: <AuthForgotPasswordPage />,
      },
      {
        path: '/auth/reset-password',
        element: <AuthResetPasswordPage />,
      },
      {
        path: '/workspace',
        element: <WorkspacePage />,
      },
      {
        path: '/performance',
        element: <PerformancePage />,
      },
      {
        path: '/agents/performance',
        element: <AgentPerformancePage />,
      },
      {
        path: '/plugins/submit',
        element: <PluginsSubmitPage />,
      },
      {
        path: "*",
        element: <NotFound />
      },
      ...systemRoutes,
    ],
  },
];
