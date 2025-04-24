
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { useUserRole } from "@/hooks/useUserRole";

export function useRouteMonitoring() {
  const location = useLocation();
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { role } = useUserRole();
  
  useEffect(() => {
    // Only monitor routes for authenticated users with a tenant
    if (!user?.id || !tenant?.id) return;
    
    const logRouteAccess = async () => {
      try {
        // Log route access
        await supabase
          .from('route_logs')
          .insert({
            user_id: user.id,
            tenant_id: tenant.id,
            route: location.pathname,
            role: role
          });
      } catch (error) {
        console.error("Error logging route access:", error);
      }
    };
    
    // Small timeout to prevent excessive logging during redirects
    const timeoutId = setTimeout(logRouteAccess, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname, user?.id, tenant?.id, role]);
  
  return null;
}
