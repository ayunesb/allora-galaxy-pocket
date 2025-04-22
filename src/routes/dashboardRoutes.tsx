import React from 'react';
import { RouteObject } from 'react-router-dom';
import DashboardIndex from "@/app/dashboard/index";

export const dashboardRoutes: RouteObject[] = [
  { path: "/dashboard", element: <DashboardIndex /> },
];
