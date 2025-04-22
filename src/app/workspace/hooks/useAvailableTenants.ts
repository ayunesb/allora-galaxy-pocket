
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface TenantOption {
  id: string;
  name: string;
  theme_color?: string;
  theme_mode?: string;
}

type Status = "idle" | "loading" | "error" | "success";

export function useAvailableTenants() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // More descriptive status could be used if needed
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      setStatus("success");
      return;
    }

    const fetchTenants = async () => {
      setLoading(true);
      setStatus("loading");
      setError(null);

      try {
        const { data: userRoles, error: rolesError } = await supabase
          .from("tenant_user_roles")
          .select("tenant_id")
          .eq("user_id", user.id);

        if (rolesError) throw rolesError;

        let tenants: TenantOption[] = [];
        if (userRoles && userRoles.length > 0) {
          const tenantIds = userRoles.map((role: any) => role.tenant_id);

          const { data: tenantsData, error: tenantsError } = await supabase
            .from("tenant_profiles")
            .select("id, name, theme_color, theme_mode")
            .in("id", tenantIds);

          if (tenantsError) throw tenantsError;
          if (tenantsData) tenants = tenantsData as TenantOption[];
        } else {
          const { data, error } = await supabase
            .from("tenant_profiles")
            .select("id, name, theme_color, theme_mode")
            .limit(10);

          if (error) throw error;
          if (data) tenants = data as TenantOption[];
        }

        setTenants(tenants);
        setStatus("success");
      } catch (err: any) {
        setError("Could not fetch workspaces. Please refresh.");
        setStatus("error");
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [user?.id]);

  return { tenants, loading, error, status };
}
