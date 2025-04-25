
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { ToastService } from "@/services/ToastService";
import { useSystemLogs } from "@/hooks/useSystemLogs";

interface AdminOnlyProps {
  children: React.ReactNode;
}

export default function AdminOnly({ children }: AdminOnlyProps) {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { logSecurityEvent } = useSystemLogs();
  
  // Check if user has admin role
  const isAdmin = React.useMemo(() => {
    // This is a placeholder - in a real app, you'd check the user's role
    // from the tenant_user_roles table or similar
    try {
      if (!user || !tenant) return false;
      
      // You might have a hook or state that determines if the user is admin
      // For now we'll assume there's a current_user_roles context or similar
      const userRole = localStorage.getItem(`${tenant.id}_role`) || 'viewer';
      return userRole === 'admin';
    } catch (error) {
      console.error("Error checking admin role:", error);
      return false;
    }
  }, [user, tenant]);
  
  React.useEffect(() => {
    if (user && tenant && !isAdmin) {
      // Log security event for unauthorized access attempt
      logSecurityEvent(
        "Unauthorized admin access attempt",
        "ACCESS_DENIED",
        { path: window.location.pathname }
      );
      
      // Show warning toast
      ToastService.warning({
        title: "Access denied",
        description: "You don't have permission to access this area"
      });
    }
  }, [user, tenant, isAdmin, logSecurityEvent]);
  
  if (!user) {
    return <Navigate to="/auth/login" replace state={{ from: window.location.pathname }} />;
  }
  
  if (!tenant) {
    return <Navigate to="/workspace" replace state={{ from: window.location.pathname }} />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}
