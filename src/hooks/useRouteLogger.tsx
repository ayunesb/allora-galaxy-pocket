
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

/**
 * Logs the current route visit to Supabase with user, role, route, timestamp.
 */
export function useRouteLogger() {
  const location = useLocation();
  const { user } = useAuth();
  const { role } = useUserRole();

  useEffect(() => {
    if (!user?.id || !role || !location.pathname) return;

    const logRouteVisit = async () => {
      try {
        const { error } = await supabase.from("route_logs").insert({
          user_id: user.id,
          role,
          route: location.pathname
        });
        
        if (error) {
          // Silently handle errors to not disrupt user experience
          // Uncomment for debugging analytics flows
          // console.error("Route log error:", error);
        }
      } catch (err) {
        // Fallback error handling
        // console.error("Route logging failed:", err);
      }
    };

    // Execute the logging function
    logRouteVisit();
    
    // Only log when pathname changes
    // eslint-disable-next-line
  }, [user?.id, role, location.pathname]);
}
