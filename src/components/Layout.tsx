
import { SidebarProvider } from "@/components/ui/sidebar"
import { Topbar } from "./Topbar"
import { AppSidebar } from "./AppSidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6 bg-background">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
