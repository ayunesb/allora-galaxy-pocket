
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
    console.log("Fetching tenants - User:", user?.id);
    
    if (!user?.id) {
      console.warn("No user ID available for tenant fetch");
      setLoading(false);
      setStatus("success");
      setTenants([]);
      return;
    }

    setLoading(true);
    setStatus("loading");
    setError(null);

    try {
      // Attempt to fetch tenants via multiple methods with detailed error handling
      const tenantRolesResponse = await supabase
        .from("tenant_user_roles")
        .select("tenant_profiles(id, name, theme_color, theme_mode)")
        .eq("user_id", user.id);

      console.log("Tenant roles response:", tenantRolesResponse);

      if (tenantRolesResponse.error) {
        console.error("Error fetching tenant roles:", tenantRolesResponse.error);
        throw tenantRolesResponse.error;
      }

      const tenantProfiles = tenantRolesResponse.data
        ?.map((item: any) => item.tenant_profiles)
        .filter(Boolean);

      console.log("Extracted tenant profiles:", tenantProfiles);

      // Fallback to direct tenant query if no tenants found via roles
      if (!tenantProfiles || tenantProfiles.length === 0) {
        const directTenantResponse = await supabase
          .from("tenant_profiles")
          .select("id, name, theme_color, theme_mode")
          .limit(10);

        console.log("Direct tenant query response:", directTenantResponse);

        if (directTenantResponse.error) {
          console.error("Error in direct tenant query:", directTenantResponse.error);
          throw directTenantResponse.error;
        }

        tenantProfiles = directTenantResponse.data || [];
      }

      setTenants(tenantProfiles);
      setStatus("success");
      setRetryCount(0);
    } catch (err: any) {
      console.error("Comprehensive tenant fetch error:", err);
      setError(err.message || "Could not fetch workspaces. Please refresh.");
      setStatus("error");
      
      // Show a toast with more context
      toast({
        title: "Workspace Fetch Error",
        description: err.message || "Unable to retrieve workspaces",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);
  
  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const retryFetch = useCallback(() => {
    if (retryCount < 3) {
      setRetryCount((prev) => prev + 1);
      fetchTenants();
    } else {
      toast({
        title: "Workspace fetch failed",
        description: "Please try refreshing the page or contact support.",
        variant: "destructive"
      });
    }
  }, [fetchTenants, retryCount, toast]);

  return { tenants, loading, error, status, retryFetch };
}
