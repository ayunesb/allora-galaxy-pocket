
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  RouteObject,
} from 'react-router-dom';
import App from './App';
import ErrorPage from './ErrorPage';
import HomePage from './app/page';
import DashboardPage from './app/dashboard/page';

// Let's create placeholder components for the missing pages
const OnboardingPage = () => <div className="p-8">Onboarding Page</div>;
const VaultPage = () => <div className="p-8">Vault Page</div>;
const StrategyPage = () => <div className="p-8">Strategy Page</div>;
const StrategyDetailsPage = () => <div className="p-8">Strategy Details Page</div>;
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

import { systemRoutes } from '@/app/system/routes';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
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
        element: <OnboardingPage />,
      },
      {
        path: '/vault',
        element: <VaultPage />,
      },
      {
        path: '/strategy',
        element: <StrategyPage />,
      },
      {
        path: '/strategy/:strategyId',
        element: <StrategyDetailsPage />,
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
      ...systemRoutes,
    ],
  },
]);

function AppRoutes() {
  return <RouterProvider router={router} />;
}

export default AppRoutes;
