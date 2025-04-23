
import React from 'react';
import { RouteObject } from 'react-router-dom';
import BillingDashboard from "@/app/billing/page";
import SubscriptionManagement from "@/app/billing/subscription/page";
import PaymentHistory from "@/app/billing/history/page";
import UsageDetails from "@/app/billing/usage/page";

export const billingRoutes: RouteObject[] = [
  { path: "/billing", element: <BillingDashboard /> },
  { path: "/billing/subscription", element: <SubscriptionManagement /> },
  { path: "/billing/history", element: <PaymentHistory /> },
  { path: "/billing/usage", element: <UsageDetails /> }
];
