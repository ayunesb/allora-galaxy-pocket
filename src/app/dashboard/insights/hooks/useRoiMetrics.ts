
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";

export function useRoiMetrics() {
  const { tenant } = useTenant();

  const { data, isLoading, error } = useQuery({
    queryKey: ["roi-metrics", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return null;

      // Fetch campaign execution metrics
      const { data: campaigns, error: campaignsError } = await supabase
        .from("campaigns")
        .select("execution_metrics, strategy_id")
        .eq("tenant_id", tenant.id)
        .not("execution_metrics", "is", null);

      if (campaignsError) throw campaignsError;

      // Fetch strategy data
      const { data: strategies, error: strategiesError } = await supabase
        .from("strategies")
        .select("id, impact_score")
        .eq("tenant_id", tenant.id);

      if (strategiesError) throw strategiesError;

      return { campaigns, strategies };
    },
    enabled: !!tenant?.id,
  });

  const metrics = useMemo(() => {
    if (!data) return null;

    const totalConversions = data.campaigns.reduce((sum, campaign) => {
      const metrics = campaign.execution_metrics as { conversions?: number };
      return sum + (metrics?.conversions || 0);
    }, 0);

    const totalViews = data.campaigns.reduce((sum, campaign) => {
      const metrics = campaign.execution_metrics as { views?: number };
      return sum + (metrics?.views || 0);
    }, 0);

    const totalClicks = data.campaigns.reduce((sum, campaign) => {
      const metrics = campaign.execution_metrics as { clicks?: number };
      return sum + (metrics?.clicks || 0);
    }, 0);

    // Convert to strings for display purposes
    return {
      conversions: totalConversions.toString(),
      views: totalViews.toString(),
      clicks: totalClicks.toString(),
      conversionRate:
        totalViews > 0
          ? ((totalConversions / totalViews) * 100).toFixed(2) + "%"
          : "0%",
      clickRate:
        totalViews > 0
          ? ((totalClicks / totalViews) * 100).toFixed(2) + "%"
          : "0%",
    };
  }, [data]);

  return {
    metrics,
    isLoading,
    error,
  };
}
