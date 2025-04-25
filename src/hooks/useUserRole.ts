
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useTenant } from "./useTenant";

export type UserRole = "admin" | "moderator" | "user" | "client" | "developer";

export function useUserRole() {
  const { user } = useAuth();
  const { tenant } = useTenant();

  const { data: role = "user", isLoading } = useQuery({
    queryKey: ['user-role', user?.id, tenant?.id],
    queryFn: async (): Promise<UserRole> => {
      if (!user || !tenant) return "user";

      try {
        // Check for tenant-specific role
        const { data: tenantRole, error: tenantError } = await supabase
          .from('tenant_user_roles')
          .select('role')
          .eq('tenant_id', tenant.id)
          .eq('user_id', user.id)
          .single();

        if (tenantRole?.role) {
          return tenantRole.role as UserRole;
        }

        // Check for system-wide role
        const { data: systemRole, error: systemError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (systemRole?.role) {
          return systemRole.role as UserRole;
        }

        // Default role
        return "user";
      } catch (error) {
        console.error("Error fetching user role:", error);
        return "user";
      }
    },
    enabled: !!user && !!tenant,
  });

  return {
    role,
    isAdmin: role === "admin",
    isLoading,
    hasRole: (requiredRole: UserRole | UserRole[]): boolean => {
      if (Array.isArray(requiredRole)) {
        return requiredRole.includes(role);
      }
      return role === requiredRole;
    }
  };
}
