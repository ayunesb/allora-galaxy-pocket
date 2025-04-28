
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tenant } from "@/types/tenant";
import { useAuth } from "@/hooks/useAuth";

export function useAvailableTenants() {
  const { user } = useAuth();

  const query = useQuery<Tenant[], Error>({
    queryKey: ["available-tenants", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User must be authenticated");

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

      return tenants || [];
    },
    enabled: !!user
  });

  return {
    tenants: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    status: query.status,
    retryFetch: () => query.refetch()
  };
}
