
// Create the missing useCampaign hook

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Campaign } from "@/types/campaign";

export function useCampaign(campaignId: string | undefined) {
  const {
    data: campaign,
    isLoading,
    error,
    refetch: refetchCampaign
  } = useQuery({
    queryKey: ["campaign-detail", campaignId],
    queryFn: async () => {
      if (!campaignId) throw new Error("Campaign ID is required");
      
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();
        
      if (error) throw error;
      if (!data) throw new Error("Campaign not found");
      
      return data as Campaign;
    },
    enabled: !!campaignId,
  });

  return {
    campaign,
    isLoading,
    error,
    refetchCampaign
  };
}
