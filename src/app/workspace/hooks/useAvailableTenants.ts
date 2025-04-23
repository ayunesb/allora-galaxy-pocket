
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
    if (!user?.id) {
      setLoading(false);
      setStatus("success");
      setTenants([]);
      return;
    }

    setLoading(true);
    setStatus("loading");
    setError(null);

    try {
      console.log("Fetching tenants for user:", user.id);
      
      // First attempt - try to get tenants through tenant_user_roles
      let data;
      let fetchError;
      
      try {
        const response = await supabase
          .from("tenant_user_roles")
          .select("tenant_id, tenant_profiles:tenant_id(id, name, theme_color, theme_mode)")
          .eq("user_id", user.id);
          
        if (!response.error && response.data?.length > 0) {
          // Extract tenant profiles from the response
          data = response.data.map((item) => item.tenant_profiles);
          console.log("Tenants found via roles:", data);
        } else {
          console.log("No tenants found via roles or error:", response.error);
          fetchError = response.error;
        }
      } catch (roleError) {
        console.error("Error fetching via tenant_user_roles:", roleError);
        fetchError = roleError;
      }
      
      // If no tenants found through roles, fallback to direct tenant query
      if (!data || data.length === 0) {
        console.log("Falling back to direct tenant query");
        
        // Fallback approach - directly fetch tenant profiles
        // This is a simplified approach that might not respect all permissions
        const fallbackResponse = await supabase
          .from("tenant_profiles")
          .select("id, name, theme_color, theme_mode")
          .limit(10);
          
        if (fallbackResponse.error) {
          throw fallbackResponse.error;
        }
        
        data = fallbackResponse.data;
        console.log("Tenants found via direct query:", data);
      }

      setTenants(data || []);
      setStatus("success");
      setRetryCount(0); // Reset retry count on success
    } catch (err: any) {
      console.error("Tenant fetch error:", err);
      setError("Could not fetch workspaces. Please refresh.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

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

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  return { tenants, loading, error, status, retryFetch };
}
