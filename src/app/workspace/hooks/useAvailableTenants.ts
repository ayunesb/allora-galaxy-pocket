
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Tenant } from "@/types/tenant";

export type TenantOption = Omit<Tenant, 'role'> & {
  role?: string;
};

type Status = "idle" | "loading" | "error" | "success";

export function useAvailableTenants() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [retryCount, setRetryCount] = useState(0);

  const fetchTenants = useCallback(async () => {
    console.log("[useAvailableTenants] Fetching tenants - User:", user?.id, "Retry count:", retryCount);
    
    if (!user) {
      console.warn("[useAvailableTenants] No user ID available for tenant fetch");
      setLoading(false);
      setStatus("success");
      setTenants([]);
      return;
    }

    setLoading(true);
    setStatus("loading");
    setError(null);

    try {
      // Get tenant profiles and user roles in one query
      const { data: tenantsWithRoles, error: tenantsError } = await supabase
        .from("tenant_user_roles")
        .select(`
          tenant_id, 
          role,
          tenant_profiles:tenant_id (
            id, 
            name, 
            theme_color, 
            theme_mode, 
            enable_auto_approve,
            is_demo
          )
        `)
        .eq("user_id", user.id)
        .limit(20);

      if (tenantsError) {
        console.error("[useAvailableTenants] Tenant query error:", tenantsError);
        throw tenantsError;
      }

      if (tenantsWithRoles && tenantsWithRoles.length > 0) {
        console.log("[useAvailableTenants] Tenant query succeeded:", tenantsWithRoles.length, "tenants");
        
        const formattedTenants = tenantsWithRoles.map(item => ({
          id: item.tenant_id,
          name: item.tenant_profiles?.name || 'Unnamed Workspace',
          theme_color: item.tenant_profiles?.theme_color,
          theme_mode: item.tenant_profiles?.theme_mode,
          enable_auto_approve: item.tenant_profiles?.enable_auto_approve,
          isDemo: item.tenant_profiles?.is_demo,
          role: item.role
        }));
        
        setTenants(formattedTenants);
        setStatus("success");
        setRetryCount(0);
        return;
      }

      console.log("[useAvailableTenants] No tenants found");
      setTenants([]);
      setStatus("success");
    } catch (err: any) {
      console.error("[useAvailableTenants] Comprehensive tenant fetch error:", err);
      setError(err.message || "Could not fetch workspaces. Please refresh.");
      setStatus("error");
      
      if (retryCount > 0) {
        toast({
          title: "Workspace Fetch Error",
          description: err.message || "Unable to retrieve workspaces",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, toast, retryCount]);
  
  useEffect(() => {
    if (user) {
      fetchTenants();
    } else {
      setTenants([]);
      setLoading(false);
      setError(null);
      setStatus("success");
    }
  }, [fetchTenants, user]);

  const retryFetch = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    fetchTenants();
  }, [fetchTenants]);

  return { tenants, loading, error, status, retryFetch };
}
