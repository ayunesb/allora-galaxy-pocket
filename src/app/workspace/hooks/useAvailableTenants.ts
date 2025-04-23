
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface TenantOption {
  id: string;
  name: string;
  theme_color?: string;
  theme_mode?: string;
}

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
      // First try the current_user_tenant_roles view approach (non-recursive)
      const viewResponse = await supabase
        .from("current_user_tenant_roles")
        .select("tenant_id")
        .then(async (result) => {
          if (result.error) {
            console.warn("[useAvailableTenants] View query error:", result.error);
            return null;
          }
          
          if (!result.data || result.data.length === 0) {
            console.log("[useAvailableTenants] No roles found via view");
            return [];
          }
          
          // Get tenant details for the found tenant IDs
          const tenantIds = result.data.map(row => row.tenant_id);
          console.log("[useAvailableTenants] Found tenant IDs:", tenantIds);
          
          const tenantsResponse = await supabase
            .from("tenant_profiles")
            .select("id, name, theme_color, theme_mode")
            .in("id", tenantIds);
            
          if (tenantsResponse.error) {
            console.error("[useAvailableTenants] Error fetching tenant details:", tenantsResponse.error);
            return null;
          }
          
          return tenantsResponse.data;
        });

      if (viewResponse !== null) {
        console.log("[useAvailableTenants] View approach succeeded:", viewResponse);
        setTenants(viewResponse);
        setStatus("success");
        setRetryCount(0);
        return;
      }

      // Fallback to direct tenant profiles query if view approach fails
      console.log("[useAvailableTenants] Falling back to direct tenant query...");
      const directTenantResponse = await supabase
        .from("tenant_profiles")
        .select("id, name, theme_color, theme_mode")
        .limit(20);

      if (directTenantResponse.error) {
        console.error("[useAvailableTenants] Direct tenant query error:", directTenantResponse.error);
        throw directTenantResponse.error;
      }

      if (directTenantResponse.data && directTenantResponse.data.length > 0) {
        console.log("[useAvailableTenants] Direct tenant query succeeded:", directTenantResponse.data.length, "tenants");
        setTenants(directTenantResponse.data);
        setStatus("success");
        setRetryCount(0);
        return;
      }

      // No tenants found through any method
      console.log("[useAvailableTenants] No tenants found through any method");
      setTenants([]);
      setStatus("success");
    } catch (err: any) {
      console.error("[useAvailableTenants] Comprehensive tenant fetch error:", err);
      setError(err.message || "Could not fetch workspaces. Please refresh.");
      setStatus("error");
      
      // Only show a toast for non-initial load errors to avoid confusion
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
      // Clear tenants when user is not logged in
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
