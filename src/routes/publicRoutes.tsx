
import React from 'react';
import { RouteObject } from 'react-router-dom';
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import OnboardingWizard from "@/app/onboarding/OnboardingWizard";
import { AuthProvider } from "@/hooks/useAuth";

export const publicRoutes: RouteObject[] = [
  { path: "/auth/login", element: <Login /> },
  { path: "/auth/signup", element: <Signup /> },
  { 
    path: "/onboarding", 
    element: (
      <AuthProvider>
        <OnboardingWizard />
      </AuthProvider>
    )
  }
];
