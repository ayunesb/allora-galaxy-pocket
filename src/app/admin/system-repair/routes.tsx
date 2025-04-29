
import { RouteObject } from "react-router-dom";
import SystemRepairPage from "./page";

export const systemRepairRoutes: RouteObject[] = [
  {
    path: "/admin/system-repair",
    element: <SystemRepairPage />
  }
];
