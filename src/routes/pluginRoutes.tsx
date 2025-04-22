
import { RouteObject } from 'react-router-dom';
import PluginBuilder from "@/pages/plugins/builder";
import PluginLeaderboard from "@/pages/plugins/leaderboard";
import RevenueShareApply from "@/pages/plugins/revenue/apply";
import PluginsDashboard from "@/pages/plugins/index";
import PluginSubmitPage from "@/pages/plugins/submit";

export const pluginRoutes: RouteObject[] = [
  { 
    path: "/plugins", 
    element: <PluginsDashboard /> 
  },
  { 
    path: "/plugins/builder", 
    element: <PluginBuilder /> 
  },
  { 
    path: "/plugins/leaderboard", 
    element: <PluginLeaderboard /> 
  },
  {
    path: "/plugins/revenue/apply",
    element: <RevenueShareApply />
  },
  {
    path: "/plugins/submit",
    element: <PluginSubmitPage />
  }
];
