
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  BookOpen, 
  CreditCard, 
  Database, 
  File, 
  FileText, 
  Layers, 
  LayoutDashboard, 
  Settings, 
  User, 
  Users, 
  Wallet,
  Building,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-background border-r border-gray-200 pt-16 hidden md:block overflow-y-auto">
      <div className="px-3 py-2">
        <nav className="space-y-1">
          <Link
            to="/dashboard"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive("/dashboard") 
              ? "bg-primary/10 text-primary" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </Link>
          
          <Link
            to="/campaigns"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive("/campaigns") 
              ? "bg-primary/10 text-primary" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <FileText className="mr-3 h-5 w-5" />
            Campaigns
          </Link>
          
          <Link
            to="/vault"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive("/vault") 
              ? "bg-primary/10 text-primary" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Layers className="mr-3 h-5 w-5" />
            Strategy Vault
          </Link>
          
          <Link
            to="/launch"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive("/launch") 
              ? "bg-primary/10 text-primary" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Wallet className="mr-3 h-5 w-5" />
            Launch
          </Link>
          
          <Link
            to="/agents"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive("/agents") 
              ? "bg-primary/10 text-primary" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Users className="mr-3 h-5 w-5" />
            Agents
          </Link>
          
          <Link
            to="/workspace"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive("/workspace") 
              ? "bg-primary/10 text-primary" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Building className="mr-3 h-5 w-5" />
            Workspace
          </Link>
          
          <Link
            to="/academy"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive("/academy") 
              ? "bg-primary/10 text-primary" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <BookOpen className="mr-3 h-5 w-5" />
            Academy
          </Link>
          
          {/* New Billing Link */}
          <Link
            to="/billing"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive("/billing") 
              ? "bg-primary/10 text-primary" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <CreditCard className="mr-3 h-5 w-5" />
            Billing
          </Link>
          
          <div className="pt-4 mt-4 border-t border-gray-200">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Account
            </h3>
            <div className="mt-1">
              <Link
                to="/settings"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive("/settings") 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </Link>
              
              <Link
                to="/profile"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive("/profile") 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <User className="mr-3 h-5 w-5" />
                Profile
              </Link>
            </div>
          </div>
          
          <div className="pt-4 mt-4 border-t border-gray-200">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Admin
            </h3>
            <div className="mt-1">
              <Link
                to="/admin/settings"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive("/admin/settings") 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Settings className="mr-3 h-5 w-5" />
                Admin Settings
              </Link>
              
              <Link
                to="/admin/security-audit"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive("/admin/security-audit") 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <File className="mr-3 h-5 w-5" />
                Security Audit
              </Link>
              
              <Link
                to="/admin/logs"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive("/admin/logs") 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Database className="mr-3 h-5 w-5" />
                System Logs
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;
