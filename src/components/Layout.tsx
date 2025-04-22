
import { SidebarProvider } from "@/components/ui/sidebar"
import Topbar from "./Topbar" 
import { AppSidebar } from "./AppSidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import SidebarInset from "./ui/sidebar/SidebarInset"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <TooltipProvider>
        <div className="min-h-screen flex w-full bg-background dark:bg-gray-900">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <Topbar />
            <SidebarInset className="flex-1 overflow-y-auto p-6 bg-background dark:bg-gray-900">
              {children}
            </SidebarInset>
          </div>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
