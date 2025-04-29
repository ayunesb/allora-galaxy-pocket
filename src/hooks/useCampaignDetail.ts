
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Campaign } from '@/types/campaign';
import { useTenant } from './useTenant';

interface CampaignDetailResult {
  campaign: Campaign | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useCampaignDetail(campaignId: string): CampaignDetailResult {
  const [error, setError] = useState<Error | null>(null);
  const { tenant } = useTenant();

  const {
    data: campaign,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async (): Promise<Campaign | null> => {
      if (!campaignId) return null;
      if (!tenant?.id) throw new Error("No active tenant found");

      try {
        const { data, error: supabaseError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', campaignId)
          .eq('tenant_id', tenant.id)
          .single();

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        return data as Campaign;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch campaign details';
        setError(new Error(errorMessage));
        throw err;
      }
    },
    enabled: !!campaignId && !!tenant?.id,
  });

  return {
    campaign,
    isLoading,
    error,
    refetch
  };
}

export default useCampaignDetail;
