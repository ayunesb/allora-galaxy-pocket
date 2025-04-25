
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import { useTenant } from "./useTenant";

export function useRouteMonitoring() {
  const location = useLocation();
  const { user } = useAuth();
  const { tenant } = useTenant();

  useEffect(() => {
    // Log route access for auditing
    if (user && tenant) {
      try {
        // You could call your logging service here
        console.log(`User ${user.id} accessed route ${location.pathname} in tenant ${tenant.id}`);
      } catch (error) {
        console.error("Failed to log route access:", error);
      }
    }
  }, [location.pathname, user, tenant]);

  return null;
}
