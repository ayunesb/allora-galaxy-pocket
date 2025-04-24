
import React from 'react';
import { RouteObject } from 'react-router-dom';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import PasswordReset from '@/pages/auth/PasswordReset';
import Index from '@/pages/Index';
import Pricing from '@/pages/Pricing';
import Explore from '@/pages/Explore';
import Docs from '@/pages/Docs';
import OnboardingWizard from '@/app/onboarding/OnboardingWizard';
import OnboardingLayout from '@/app/onboarding/OnboardingLayout';
import WorkspacePage from '@/app/workspace/page';

export const publicRoutes: RouteObject[] = [
  { path: '/auth/login', element: <Login /> },
  { path: '/auth/signup', element: <Signup /> },
  { path: '/auth/reset-password', element: <PasswordReset /> },
  { path: '/marketing', element: <Index /> },
  { path: '/', element: <Index /> },
  { path: '/pricing', element: <Pricing /> },
  { path: '/explore', element: <Explore /> },
  { path: '/docs', element: <Docs /> },
  {
    path: '/onboarding',
    element: (
      <OnboardingLayout>
        <OnboardingWizard />
      </OnboardingLayout>
    )
  },
  { path: '/workspace', element: <WorkspacePage /> }
];
