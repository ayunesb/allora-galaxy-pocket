
import { RouteObject } from 'react-router-dom';
import PluginBuilder from "@/pages/plugins/builder";
import PluginLeaderboard from "@/pages/plugins/leaderboard";
import RevenueShareApply from "@/pages/plugins/revenue/apply";
import PluginsDashboard from "@/pages/plugins/index";
import PluginSubmitPage from "@/pages/plugins/submit";
import PluginsPage from "@/pages/plugins/page";
import PluginSettingsPage from "@/app/plugins/settings/index";
import MyPluginsPage from "@/app/plugins/my/page";
import PluginExplorePage from "@/pages/plugins/explore";

export const pluginRoutes: RouteObject[] = [
  { path: "/plugins", element: <PluginsPage /> },
  { path: "/plugins/builder", element: <PluginBuilder /> },
  { path: "/plugins/leaderboard", element: <PluginLeaderboard /> },
  { path: "/plugins/revenue/apply", element: <RevenueShareApply /> },
  { path: "/plugins/submit", element: <PluginSubmitPage /> },
  { path: "/plugins/settings", element: <PluginSettingsPage /> },
  { path: "/plugins/my", element: <MyPluginsPage /> },
  { path: "/plugins/explore", element: <PluginExplorePage /> }
];
