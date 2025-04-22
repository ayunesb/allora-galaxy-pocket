
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import type { TrendType } from "./useKpiHistory";
import type { Campaign } from "@/types/campaign";

export function useCampaignMetrics(dateRange: string) {
  const { tenant } = useTenant();
  const formattedStartDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const [campaignApprovalRate, setCampaignApprovalRate] = useState({ 
    current: 0, 
    trend: 'neutral' as TrendType, 
    change: 0 
  });

  const { data: campaigns } = useQuery({
    queryKey: ['top-campaigns', tenant?.id, dateRange],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('tenant_id', tenant.id)
        .gte('created_at', formattedStartDate)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as Campaign[];
    },
    enabled: !!tenant?.id
  });

  useEffect(() => {
    if (campaigns) {
      const approvedCampaigns = campaigns.filter(c => c.status === 'active').length;
      const totalCampaigns = campaigns.length;
      const approvalRate = totalCampaigns > 0 ? Math.round((approvedCampaigns / totalCampaigns) * 100) : 0;
      
      setCampaignApprovalRate({
        current: approvalRate,
        trend: 'neutral',
        change: 0
      });
    }
  }, [campaigns]);

  return { campaignApprovalRate, topCampaigns: campaigns || [] };
}
