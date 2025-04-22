
import React from 'react';
import { RouteObject } from 'react-router-dom';
import Docs from "@/pages/Docs";
import Explore from "@/pages/Explore";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import OnboardingLayout from "@/app/onboarding/OnboardingLayout";
import OnboardingWizard from "@/app/onboarding/OnboardingWizard";
import TermsOfUse from "@/pages/legal/terms";
import PrivacyPolicy from "@/pages/legal/privacy";
import CookiePolicy from "@/pages/legal/cookie";
import AIDisclosure from "@/pages/legal/ai-disclosure";
import DataProcessingAddendum from "@/pages/legal/dpa";

export const publicRoutes: RouteObject[] = [
  { path: "/docs", element: <Docs /> },
  { path: "/explore", element: <Explore /> },
  { path: "/auth/login", element: <Login /> },
  { path: "/auth/signup", element: <Signup /> },
  { 
    path: "/onboarding", 
    element: (
      <ErrorBoundary>
        <OnboardingLayout>
          <OnboardingWizard />
        </OnboardingLayout>
      </ErrorBoundary>
    ) 
  },
  // Legal routes
  { path: "/legal/terms", element: <TermsOfUse /> },
  { path: "/legal/privacy", element: <PrivacyPolicy /> },
  { path: "/legal/cookie", element: <CookiePolicy /> },
  { path: "/legal/ai-disclosure", element: <AIDisclosure /> },
  { path: "/legal/dpa", element: <DataProcessingAddendum /> }
];
