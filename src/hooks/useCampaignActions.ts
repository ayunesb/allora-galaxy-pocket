
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';

export function useCampaignActions() {
  const [isLoading, setIsLoading] = useState(false);
  const { tenant } = useTenant();

  const executeCampaign = async (campaignId: string) => {
    if (!tenant?.id) throw new Error("No active tenant found");
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({
          status: 'active',
          execution_status: 'running',
          execution_start_date: new Date().toISOString()
        })
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id);

      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const pauseCampaign = async (campaignId: string) => {
    if (!tenant?.id) throw new Error("No active tenant found");
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({
          execution_status: 'paused'
        })
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id);

      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    if (!tenant?.id) throw new Error("No active tenant found");
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id);

      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    executeCampaign, 
    pauseCampaign, 
    deleteCampaign,
    isLoading 
  };
}
