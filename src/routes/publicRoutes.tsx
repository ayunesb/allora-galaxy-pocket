
import React from 'react';
import { RouteObject } from 'react-router-dom';
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import OnboardingWizard from "@/app/onboarding/OnboardingWizard";
import UnauthorizedPage from "@/pages/unauthorized/page";
import PasswordReset from "@/pages/auth/PasswordReset";

export const publicRoutes: RouteObject[] = [
  { path: "/auth/login", element: <Login /> },
  { path: "/auth/signup", element: <Signup /> },
  { path: "/auth/recovery", element: <PasswordReset /> },
  { path: "/onboarding", element: <OnboardingWizard /> },
  { path: "/unauthorized", element: <UnauthorizedPage /> }
];
