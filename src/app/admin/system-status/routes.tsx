
import { RouteObject } from "react-router-dom";
import SystemStatusPage from "./page";

export const systemStatusRoutes: RouteObject[] = [
  {
    path: "/admin/system-status",
    element: <SystemStatusPage />
  }
];
