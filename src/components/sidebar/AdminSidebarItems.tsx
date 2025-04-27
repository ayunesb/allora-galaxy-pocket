
import React from 'react';
import { SidebarNavItem } from '@/types/sidebar';
import {
  LayoutDashboard,
  Users,
  Settings,
  CreditCard,
  LineChart,
  Building,
  Bell,
  Activity,
  BarChart,
  CalendarClock,
  FileText,
  Megaphone,
  Zap,
  Shield,
  BadgeCheck,
  FileCheck,
  MonitorCheck
} from 'lucide-react';

export const adminSidebarItems: SidebarNavItem[] = [
  {
    title: "Admin",
    items: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: <LayoutDashboard className="h-4 w-4" />,
      },
      {
        title: "User Management",
        href: "/admin/users",
        icon: <Users className="h-4 w-4" />,
      },
      {
        title: "Billing",
        href: "/admin/billing",
        icon: <CreditCard className="h-4 w-4" />,
      },
      {
        title: "Analytics",
        href: "/admin/analytics",
        icon: <LineChart className="h-4 w-4" />,
      },
      {
        title: "Organizations",
        href: "/admin/organizations",
        icon: <Building className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "Monitoring",
    items: [
      {
        title: "Alerts",
        href: "/admin/alerts",
        icon: <Bell className="h-4 w-4" />,
      },
      {
        title: "System Status",
        href: "/admin/system-status",
        icon: <MonitorCheck className="h-4 w-4" />,
        badge: "New"
      },
      {
        title: "Logs",
        href: "/admin/logs",
        icon: <Activity className="h-4 w-4" />,
      },
      {
        title: "Performance",
        href: "/admin/performance",
        icon: <BarChart className="h-4 w-4" />,
      },
      {
        title: "Jobs",
        href: "/admin/jobs",
        icon: <CalendarClock className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "Marketing",
    items: [
      {
        title: "Content",
        href: "/admin/content",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        title: "Campaigns",
        href: "/admin/campaign-performance",
        icon: <Megaphone className="h-4 w-4" />,
      },
      {
        title: "Automation",
        href: "/admin/automation-metrics",
        icon: <Zap className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "Security",
    items: [
      {
        title: "Security Dashboard",
        href: "/admin/security-audit/dashboard",
        icon: <Shield className="h-4 w-4" />,
      },
      {
        title: "RLS Audit",
        href: "/admin/security-audit/report",
        icon: <BadgeCheck className="h-4 w-4" />,
      },
      {
        title: "Production Ready",
        href: "/admin/production-readiness",
        icon: <FileCheck className="h-4 w-4" />,
      },
    ],
  },
];
