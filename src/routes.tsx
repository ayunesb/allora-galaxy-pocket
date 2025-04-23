
import React from 'react';
import { RouteObject } from 'react-router-dom';
import { publicRoutes } from './routes/publicRoutes';
import { appRoutes } from './routes/appRoutes';
import { dashboardRoutes } from './routes/dashboardRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { pluginRoutes } from './routes/pluginRoutes';
import { billingRoutes } from './routes/billingRoutes';

// Combine all routes
const routes: RouteObject[] = [
  ...publicRoutes,
  ...dashboardRoutes,
  ...appRoutes,
  ...adminRoutes,
  ...pluginRoutes, 
  ...billingRoutes
];

export default routes;
