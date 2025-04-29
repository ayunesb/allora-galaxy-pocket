
import { useTenant } from "./useTenant";
import { useAuth } from "./useAuth";
import { useUserRole } from "./useUserRole";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useRouteAccess() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [role, setRole] = useState<string>('viewer');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRole = async () => {
      if (!user || !tenant) {
        setRole('viewer');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc(
          'get_user_role_for_tenant_safe',
          { tenant_uuid: tenant.id, user_uuid: user.id }
        );

        if (error) throw error;
        setRole(data || 'viewer');
      } catch (error) {
        console.error("Error loading user role:", error);
        setRole('viewer');
      } finally {
        setIsLoading(false);
      }
    };

    loadRole();
  }, [user, tenant]);

  const canAccessRoute = (route: string): boolean => {
    // Public routes - always accessible
    if (
      route.startsWith("/auth/") ||
      route === "/" ||
      route === "/marketing" ||
      route === "/pricing" ||
      route === "/explore" ||
      route === "/docs" ||
      route.startsWith("/legal/")
    ) {
      return true;
    }

    // Authenticated user check
    if (!user) {
      return false;
    }

    // Workspace page is always accessible to authenticated users
    if (route === "/workspace") {
      return true;
    }

    // Onboarding page is accessible to users with a tenant
    if (route === "/onboarding" && tenant) {
      return true;
    }

    // System routes need authentication but not tenant
    if (route === "/system/connection-test") {
      return true;
    }

    // Need tenant for all other routes
    if (!tenant) {
      return false;
    }

    // Admin-only routes
    if (route.startsWith("/admin/") && role !== "admin") {
      return false;
    }

    // Security audit routes
    if (route.includes("/security-audit/") && !["admin"].includes(role)) {
      return false;
    }

    return true;
  };

  return {
    canAccessRoute,
    userRole: role,
    isLoading
  };
}
