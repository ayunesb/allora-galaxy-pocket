
import { RouteObject } from 'react-router-dom';
import PluginsDashboard from "@/pages/plugins/index";
import PluginBuilder from "@/pages/plugins/builder";
import PluginLeaderboard from "@/pages/plugins/leaderboard";
import RevenueShareApply from "@/pages/plugins/revenue/apply";
import PluginSubmitPage from "@/pages/plugins/submit";
import PluginsPage from "@/pages/plugins/page";
import PluginSettingsPage from "@/app/plugins/settings/index";
import MyPluginsPage from "@/app/plugins/my/page";
import PluginExplorePage from "@/pages/plugins/explore";
import PluginPerformance from "@/pages/plugins/performance";
import PluginMarketplace from "@/pages/plugins/marketplace/PluginMarketplace";
import PluginUsageAnalytics from "@/pages/plugins/analytics/PluginUsageAnalytics";
import PluginConfiguration from "@/pages/plugins/config/PluginConfiguration";

export const pluginRoutes: RouteObject[] = [
  { path: "/plugins", element: <PluginsPage /> },
  { path: "/plugins/dashboard", element: <PluginsDashboard /> },
  { path: "/plugins/builder", element: <PluginBuilder /> },
  { path: "/plugins/leaderboard", element: <PluginLeaderboard /> },
  { path: "/plugins/performance", element: <PluginPerformance /> },
  { path: "/plugins/revenue/apply", element: <RevenueShareApply /> },
  { path: "/plugins/submit", element: <PluginSubmitPage /> },
  { path: "/plugins/settings", element: <PluginSettingsPage /> },
  { path: "/plugins/my", element: <MyPluginsPage /> },
  { path: "/plugins/explore", element: <PluginExplorePage /> },
  { path: "/plugins/marketplace", element: <PluginMarketplace /> },
  { path: "/plugins/analytics", element: <PluginUsageAnalytics /> },
  { path: "/plugins/config/:pluginKey", element: <PluginConfiguration /> }
];
