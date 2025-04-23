
import { SidebarProvider } from "@/components/ui/sidebar"
import Topbar from "./Topbar" 
import { AppSidebar } from "./AppSidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import SidebarInset from "./ui/sidebar/SidebarInset"
import { useAppLayout } from "@/hooks/useAppLayout"
import { Skeleton } from "./ui/skeleton"
import { useEffect } from "react"
import { useRouteLogger } from "@/hooks/useRouteLogger"

export default function Layout({ children }: { children: React.ReactNode }) {
  const { layout, isLoading } = useAppLayout();

  // Track route usage on every page load
  useRouteLogger();

  // Apply theme from layout
  useEffect(() => {
    if (layout?.config?.theme) {
      // Set theme mode (light/dark)
      if (layout.config.theme.mode !== 'auto') {
        document.documentElement.classList.toggle(
          'dark', 
          layout.config.theme.mode === 'dark'
        );
      }

      // Theme color could be applied here if needed
    }
  }, [layout]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex w-full bg-background dark:bg-gray-900">
        <Skeleton className="w-64 h-screen" />
        <div className="flex-1 flex flex-col">
          <Skeleton className="h-16 w-full" />
          <div className="flex-1 p-6">
            <Skeleton className="w-full h-[200px] mb-4" />
            <Skeleton className="w-full h-[400px]" />
          </div>
        </div>
      </div>
    );
  }

  const showSidebar = layout?.config?.sidebar?.enabled !== false;
  const showTopbar = layout?.config?.topbar?.enabled !== false;
  
  return (
    <SidebarProvider>
      <TooltipProvider>
        <div className="min-h-screen flex w-full bg-background dark:bg-gray-900">
          {showSidebar && <AppSidebar />}
          <div className="flex-1 flex flex-col">
            {showTopbar && <Topbar />}
            <SidebarInset className="flex-1 overflow-y-auto p-6 bg-background dark:bg-gray-900">
              {children}
            </SidebarInset>
          </div>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
