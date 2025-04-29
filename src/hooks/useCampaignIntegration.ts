
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';

export function useCampaignIntegration() {
  const [isLoading, setIsLoading] = useState(false);
  const { tenant } = useTenant();

  const updateCampaignExecutionStatus = async (
    campaignId: string,
    status: string,
    metrics?: Record<string, any>
  ) => {
    if (!tenant?.id) throw new Error("No active tenant found");
    
    setIsLoading(true);
    try {
      const updateData: Record<string, any> = {
        execution_status: status
      };
      
      if (metrics) {
        updateData.execution_metrics = metrics;
      }
      
      if (status === 'running') {
        updateData.status = 'active';
      }
      
      const { error } = await supabase
        .from('campaigns')
        .update(updateData)
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id);

      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    updateCampaignExecutionStatus,
    isLoading 
  };
}
