
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";

export function useAgentProfile() {
  const { tenant } = useTenant();

  return useQuery({
    queryKey: ["agent-profile", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return null;

      const { data, error } = await supabase
        .from("agent_profiles")
        .select("*")
        .eq("tenant_id", tenant.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id,
  });
}
