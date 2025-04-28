
import { RouteObject } from "react-router-dom";
import LaunchReadinessPage from "./page";

export const launchReadinessRoutes: RouteObject[] = [
  {
    path: "/admin/launch-readiness",
    element: <LaunchReadinessPage />
  }
];
