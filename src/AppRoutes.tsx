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
import OnboardingPage from './app/onboarding/page';
import VaultPage from './app/vault/page';
import StrategyPage from './app/strategy/page';
import StrategyDetailsPage from './app/strategy/[strategyId]/page';
import CampaignsCenter from './app/campaigns/center/page';
import LaunchPage from './app/launch/page';
import InsightsKpisPage from './app/dashboard/insights/kpis/page';
import AdminSecurityAuditPage from './app/admin/security-audit/page';
import AdminIntegrationsPage from './app/admin/integrations/page';
import AdminUsersPage from './app/admin/users/page';
import AuthLoginPage from './app/auth/login/page';
import AuthRegisterPage from './app/auth/register/page';
import AuthForgotPasswordPage from './app/auth/forgot-password/page';
import AuthResetPasswordPage from './app/auth/reset-password/page';
import WorkspacePage from './app/workspace/page';
import PerformancePage from './app/dashboard/performance';
import AgentPerformancePage from './app/agents/performance/page';
import PluginsSubmitPage from './pages/plugins/submit';
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
