
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
      // Direct tenant profiles query with safe approach
      const { data: directTenantResponse, error: tenantError } = await supabase
        .from("tenant_profiles")
        .select("id, name, theme_color, theme_mode, isDemo, enable_auto_approve")
        .limit(20);

      if (tenantError) {
        console.error("[useAvailableTenants] Tenant query error:", tenantError);
        throw tenantError;
      }

      if (directTenantResponse && directTenantResponse.length > 0) {
        console.log("[useAvailableTenants] Tenant query succeeded:", directTenantResponse.length, "tenants");
        setTenants(directTenantResponse);
        setStatus("success");
        setRetryCount(0);
        return;
      }

      // If no tenants found or error occurred, return empty
      console.log("[useAvailableTenants] No tenants found");
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
