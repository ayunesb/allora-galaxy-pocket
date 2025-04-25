
import React from 'react';
import { RouteObject } from 'react-router-dom';
import ConnectionTestPage from './connection-test/page';

export const systemRoutes: RouteObject[] = [
  {
    path: 'system/connection-test',
    element: <ConnectionTestPage />,
  },
];
