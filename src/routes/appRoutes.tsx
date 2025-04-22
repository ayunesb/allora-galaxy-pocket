
import React from 'react';
import { RouteObject } from 'react-router-dom';
import StartupPage from "@/app/startup/page";
import RecoveryPage from "@/pages/recovery/page";
import CreateGalaxyPage from "@/app/galaxy/create/page";
import CoachingFeed from "@/app/coaching/feed/CoachingFeed";

export const appRoutes: RouteObject[] = [
  { path: "/startup", element: <StartupPage /> },
  { path: "/recovery", element: <RecoveryPage /> },
  { path: "/galaxy/create", element: <CreateGalaxyPage /> },
  { path: "/coaching/feed", element: <CoachingFeed /> },
  { path: "/creative/suite", element: <div>Creative Suite</div> }
];
