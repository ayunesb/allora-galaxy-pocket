
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
    // Enhanced logging for debugging
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
      // Try direct tenant profiles query first - simpler and less prone to RLS issues
      const directTenantResponse = await supabase
        .from("tenant_profiles")
        .select("id, name, theme_color, theme_mode")
        .limit(20);

      console.log("[useAvailableTenants] Direct tenant query response:", directTenantResponse);

      if (directTenantResponse.error) {
        console.error("[useAvailableTenants] Error in direct tenant query:", directTenantResponse.error);
        
        // If this is an RLS error, try the alternative approach
        if (directTenantResponse.error.message.includes("permission denied") || 
            directTenantResponse.error.message.includes("policy")) {
          console.log("[useAvailableTenants] Falling back to tenant_user_roles approach due to RLS");
        } else {
          throw directTenantResponse.error;
        }
      }

      // If direct query works, use that data
      if (directTenantResponse.data && directTenantResponse.data.length > 0) {
        setTenants(directTenantResponse.data);
        setStatus("success");
        setRetryCount(0);
        return;
      }

      // Otherwise try via tenant_user_roles relationship
      console.log("[useAvailableTenants] No direct tenants found, trying via user roles...");
      const tenantRolesResponse = await supabase
        .from("tenant_user_roles")
        .select("tenant_profiles(id, name, theme_color, theme_mode)")
        .eq("user_id", user.id);

      console.log("[useAvailableTenants] Tenant roles response:", tenantRolesResponse);

      if (tenantRolesResponse.error) {
        console.error("[useAvailableTenants] Error fetching tenant roles:", tenantRolesResponse.error);
        throw tenantRolesResponse.error;
      }

      const tenantProfiles = tenantRolesResponse.data
        ?.map((item: any) => item.tenant_profiles)
        .filter(Boolean);

      console.log("[useAvailableTenants] Extracted tenant profiles:", tenantProfiles);
      
      setTenants(tenantProfiles || []);
      setStatus("success");
      setRetryCount(0);
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
