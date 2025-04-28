
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tenant } from "@/types/tenant";
import { useAuth } from "@/hooks/useAuth";

export interface TenantOption extends Tenant {
  isOwner?: boolean;
  role?: string;
}

/**
 * Enhanced hook to fetch available tenants for the current user with better error handling
 * @returns List of available tenants with loading and error states
 */
export function useAvailableTenants() {
  const { user } = useAuth();

  const query = useQuery<TenantOption[], Error>({
    queryKey: ["available-tenants", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User must be authenticated");
      
      try {
        // Get tenant IDs the user has access to using our security definer function
        const { data: tenantIds, error: idsError } = await supabase
          .rpc('get_user_tenant_ids_safe');

        if (idsError) throw idsError;

        if (!tenantIds?.length) return [];

        // Fetch full tenant details
        const { data: tenants, error } = await supabase
          .from("tenant_profiles")
          .select("*")
          .in("id", tenantIds)
          .order("name");

        if (error) throw error;

        // Get user roles for each tenant to mark ownership status
        const { data: userRoles, error: rolesError } = await supabase
          .from("tenant_user_roles")
          .select("tenant_id, role")
          .eq("user_id", user.id);

        if (rolesError) throw rolesError;

        // Enhance tenant objects with additional role info
        const enhancedTenants = tenants.map(tenant => {
          const userRole = userRoles?.find(role => role.tenant_id === tenant.id);
          return {
            ...tenant,
            isOwner: userRole?.role === 'admin',
            role: userRole?.role || 'viewer'
          };
        });

        return enhancedTenants || [];
      } catch (error) {
        console.error("Error fetching workspaces:", error);
        throw error;
      }
    },
    enabled: !!user,
    retry: 1, // Only retry once to avoid overwhelming the user with errors
    staleTime: 1000 * 60 * 5, // Cache results for 5 minutes
  });

  return {
    tenants: query.data || [],
    loading: query.isLoading || query.isFetching,
    error: query.error?.message || null,
    status: query.status,
    refetching: query.isFetching && !query.isLoading,
    retryFetch: () => query.refetch()
  };
}
