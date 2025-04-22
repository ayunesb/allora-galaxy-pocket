
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
      return;
    }

    setLoading(true);
    setStatus("loading");
    setError(null);

    try {
      // Simplify the approach - directly fetch available tenant profiles
      // This avoids the recursive RLS policy issue by not querying tenant_user_roles
      const { data, error: fetchError } = await supabase
        .from("tenant_profiles")
        .select("id, name, theme_color, theme_mode")
        .limit(10);

      if (fetchError) throw fetchError;

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
