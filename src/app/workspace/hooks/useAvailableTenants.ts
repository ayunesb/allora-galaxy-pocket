
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tenant } from "@/types/tenant";

export interface TenantOption extends Tenant {}

/**
 * Hook to fetch available tenants for the current user
 * @returns List of available tenants and loading state
 */
export function useAvailableTenants() {
  const query = useQuery<Tenant[], Error>({
    queryKey: ["available-tenants"],
    queryFn: async () => {
      const { data: tenants, error } = await supabase
        .from("tenants")
        .select("*")
        .order("name");

      if (error) throw error;

      return (tenants || []).map((tenant): Tenant => ({
        id: tenant.id,
        name: tenant.name,
        theme_color: tenant.theme_color,
        theme_mode: tenant.theme_mode,
        enable_auto_approve: tenant.enable_auto_approve,
        isDemo: tenant.is_demo,
        role: tenant.role
      }));
    }
  });

  return {
    tenants: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    status: query.status,
    retryFetch: () => query.refetch()
  };
}
