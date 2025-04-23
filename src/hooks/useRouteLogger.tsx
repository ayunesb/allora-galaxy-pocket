
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

    supabase.from("route_logs").insert({
      user_id: user.id,
      role,
      route: location.pathname
    }).catch(err => {
      // Don't block app on analytics errors
      // Uncomment for debugging analytics flows
      // console.error("Route log error:", err);
    });
    // Only log when pathname changes
    // eslint-disable-next-line
  }, [user?.id, role, location.pathname]);
}
