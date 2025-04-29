
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { Strategy } from "@/types/strategy";
import { Campaign } from "@/types/campaign";
import { mapJsonToStrategy } from "@/types/strategy.d";

export function useStrategyAndCampaigns() {
  const { tenant } = useTenant();

  const { data: strategies } = useQuery({
    queryKey: ["strategies", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from("strategies")
        .select("*")
        .eq("tenant_id", tenant.id)
        .limit(5);
        
      if (error) throw error;
      
      // Use the mapJsonToStrategy helper to ensure all fields are properly set
      return (data || []).map(item => mapJsonToStrategy(item));
    },
    enabled: !!tenant?.id,
  });

  const { data: campaigns } = useQuery({
    queryKey: ["campaigns", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("tenant_id", tenant.id)
        .limit(5);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant?.id,
  });

  return { strategies, campaigns };
}
