
import { RouteObject } from 'react-router-dom';
import PluginBuilder from "@/pages/plugins/builder";
import PluginLeaderboard from "@/pages/plugins/leaderboard";
import RevenueShareApply from "@/pages/plugins/revenue/apply";

export const pluginRoutes: RouteObject[] = [
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
  }
];
