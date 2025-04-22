
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DarkModeToggle from "@/components/ui/DarkModeToggle"; // Fixed: Changed from named import to default import
import { useTenant } from "@/hooks/useTenant";
import { NotificationBell } from "@/components/NotificationBell";

interface TopbarProps {
  onMenuToggle?: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const { tenant } = useTenant();
  const [tenantDetails, setTenantDetails] = useState({
    name: "Workspace",
    theme_mode: "light",
    theme_color: "indigo",
  });

  useEffect(() => {
    if (tenant) {
      setTenantDetails({
        name: tenant.name || "Workspace",
        theme_mode: tenant.theme_mode || "light",
        theme_color: tenant.theme_color || "indigo",
      });
    }
  }, [tenant]);

  return (
    <header className="border-b p-4 bg-white dark:bg-gray-900">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Button
            onClick={onMenuToggle}
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            title="Toggle Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
            <span className="sr-only">Toggle Menu</span>
          </Button>
          
          <Link to="/dashboard" className="flex items-center gap-1">
            <span className="text-lg font-semibold">Allora OS</span>
            <span className="bg-primary text-primary-foreground text-xs px-1 ml-1 rounded">
              2.1
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Workspace Name */}
          <Link to="/workspace" className="hidden md:block">
            <Button variant="outline" size="sm" className="gap-2">
              <span>{tenantDetails.name}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m7 15 5 5 5-5" />
                <path d="m7 9 5-5 5 5" />
              </svg>
            </Button>
          </Link>
          
          {/* Notification Bell */}
          <NotificationBell />

          {/* Theme Toggle */}
          <DarkModeToggle />

          {/* User Menu (placeholder) */}
          <Button variant="ghost" className="rounded-full" size="icon">
            <span className="sr-only">User Menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Button>
        </div>
      </div>
    </header>
  );
}
