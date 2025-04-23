
import { 
  Home, 
  Rocket, 
  BriefcaseBusiness, 
  BarChart2, 
  Settings,
  UserPlus,
  Lightbulb,
  Palette,
  MessageSquare,
  Bell,
  Bot,
  PlusCircle,
  Send,
  List,
  Shield,
  DollarSign,
  Star,
  Database,
  Search,
  AlertTriangle
} from "lucide-react";

export const dashboardItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: BarChart2, label: "Insights", path: "/dashboard/insights" },
  { icon: BarChart2, label: "Performance", path: "/dashboard/performance" },
  { icon: BarChart2, label: "KPIs", path: "/dashboard/kpi" },
  { icon: BarChart2, label: "Team Activity", path: "/dashboard/team-activity" },
  { icon: AlertTriangle, label: "Incidents", path: "/dashboard/incidents" },
  { icon: Bell, label: "Alerts", path: "/dashboard/alerts" },
  { icon: Home, label: "Startup", path: "/dashboard/startup" },
];

export const featureItems = [
  { icon: Rocket, label: "Launch", path: "/launch" },
  { icon: BriefcaseBusiness, label: "Strategy", path: "/strategy" },
  { icon: BarChart2, label: "Campaigns", path: "/campaigns/center" },
  { icon: MessageSquare, label: "Assistant", path: "/assistant" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: Lightbulb, label: "AI Coach", path: "/coaching/feed" },
  { icon: Bot, label: "Agents", path: "/agents" },
  { icon: Palette, label: "Creative Suite", path: "/creative/suite" },
];

export const adminItems = [
  { icon: Shield, label: "Admin Review", path: "/admin/plugins/review" },
  { icon: DollarSign, label: "Plugin Earnings", path: "/admin/plugins/earnings" },
  { icon: PlusCircle, label: "Add Plugin", path: "/admin/plugins/gallery" },
  { icon: UserPlus, label: "Invite Users", path: "/admin/invite" },
  { icon: Database, label: "Agent Memory", path: "/admin/agents/memory" },
  { icon: Search, label: "Agent Collab", path: "/admin/agents/collaboration" },
];

export const pluginItems = [
  { icon: Settings, label: "Plugin Settings", path: "/plugins/settings" },
  { icon: PlusCircle, label: "Plugin Marketplace", path: "/plugins/explore" },
  { icon: List, label: "My Plugins", path: "/plugins/my" },
  { icon: Send, label: "Submit Plugin", path: "/plugins/submit" },
  { icon: DollarSign, label: "Revenue Share", path: "/plugins/revenue/apply" },
  { icon: Star, label: "Plugin Builder", path: "/plugins/builder" },
  { icon: Star, label: "Publish to Galaxy", path: "/galaxy/create" },
];
