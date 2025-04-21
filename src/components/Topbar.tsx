
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { User } from "lucide-react";

export function Topbar() {
  const { user, logout } = useAuth();
  
  return (
    <header className="border-b bg-background px-4 py-3 flex items-center gap-4">
      <SidebarTrigger />
      <div className="flex-1 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {user || "Guest"}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={logout}
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
