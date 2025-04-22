
import { RouteObject } from 'react-router-dom';
import PluginBuilder from "@/pages/plugins/builder";
import PluginLeaderboard from "@/pages/plugins/leaderboard";

export const pluginRoutes: RouteObject[] = [
  { 
    path: "/plugins/builder", 
    element: <PluginBuilder /> 
  },
  { 
    path: "/plugins/leaderboard", 
    element: <PluginLeaderboard /> 
  }
];
