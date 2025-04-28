
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { Campaign } from '@/types/campaign';
import { useQuery } from '@tanstack/react-query';

export const useCampaigns = () => {
  const { tenant } = useTenant();

  const {
    data: campaigns,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['campaigns', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];

      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return data as Campaign[];
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        throw err;
      }
    },
    enabled: !!tenant?.id
  });

  return {
    campaigns: campaigns || [],
    isLoading,
    error: error as Error | null,
    refetch
  };
};

export const useCampaign = (id: string | undefined) => {
  const { tenant } = useTenant();

  const {
    data: campaign,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['campaign-detail', id],
    queryFn: async () => {
      if (!id || !tenant?.id) return null;

      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*, strategies(*)')
          .eq('id', id)
          .eq('tenant_id', tenant.id)
          .single();

        if (error) throw error;

        return data as Campaign & { strategies: any };
      } catch (err) {
        console.error('Error fetching campaign details:', err);
        throw err;
      }
    },
    enabled: !!id && !!tenant?.id
  });

  return {
    campaign,
    isLoading,
    error: error as Error | null,
    refetch
  };
};
