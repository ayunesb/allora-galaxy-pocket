
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tenant } from "@/types/tenant";

export type TenantOption = Tenant;

export function useAvailableTenants() {
  return useQuery({
    queryKey: ["available-tenants"],
    queryFn: async () => {
      const { data: tenants, error } = await supabase
        .from("tenants")
        .select("*")
        .order("name");

      if (error) throw error;

      return (tenants || []).map((tenant): TenantOption => ({
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
}
