
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { Strategy } from "@/types/strategy";
import { Campaign } from "@/types/campaign";

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
      
      // Transform to match Strategy interface with all required fields
      return (data || []).map(item => ({
        ...item,
        metrics_target: item.metrics_target || {},
        metrics_baseline: item.metrics_baseline || {},
        tags: item.tags || [],
        goals: item.goals || [],
        channels: item.channels || [],
        kpis: item.kpis || [],
        updated_at: item.updated_at || item.created_at,
        version: item.version || 1,
        reason_for_recommendation: item.reason_for_recommendation || '',
        target_audience: item.target_audience || '',
      })) as Strategy[];
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
