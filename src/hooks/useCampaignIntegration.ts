
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';
import { useToast } from './use-toast';

export function useCampaignIntegration() {
  const [isLoading, setIsLoading] = useState(false);
  const { tenant } = useTenant();
  const { toast } = useToast();

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

  // Add missing methods
  const trackCampaignOutcome = async (
    campaignId: string,
    eventType: string,
    value: number,
    metadata?: Record<string, any>
  ) => {
    if (!tenant?.id) throw new Error("No active tenant found");
    
    setIsLoading(true);
    try {
      // Track the campaign outcome by updating metrics
      const existingData = await supabase
        .from('campaigns')
        .select('execution_metrics')
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id)
        .single();
      
      if (existingData.error) throw existingData.error;
      
      const currentMetrics = existingData.data?.execution_metrics || {};
      const updatedMetrics = {
        ...currentMetrics,
        [eventType]: value,
        last_updated: new Date().toISOString(),
        ...metadata
      };
      
      await updateCampaignExecutionStatus(campaignId, 'running', updatedMetrics);
      
      // Log the event
      await supabase.from('system_logs').insert({
        tenant_id: tenant.id,
        event_type: 'CAMPAIGN_TRACKING',
        message: `Campaign tracking event: ${eventType}`,
        meta: { campaign_id: campaignId, value, event_type: eventType, ...metadata },
        severity: 'info'
      });
      
      return true;
    } catch (error) {
      console.error("Failed to track campaign outcome:", error);
      toast({
        title: "Tracking Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getCampaignExecutionMetrics = async (campaignId: string) => {
    if (!tenant?.id) throw new Error("No active tenant found");
    
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('execution_metrics')
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id)
        .single();
      
      if (error) throw error;
      
      return data?.execution_metrics || {};
    } catch (error) {
      console.error("Failed to get campaign execution metrics:", error);
      throw error;
    }
  };

  const convertStrategyToCampaign = async (strategy: any) => {
    if (!tenant?.id) throw new Error("No active tenant found");
    
    setIsLoading(true);
    try {
      // Create a campaign from the strategy
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          name: `Campaign from: ${strategy.title}`,
          description: strategy.description,
          status: 'draft',
          execution_status: 'pending',
          strategy_id: strategy.id,
          tenant_id: tenant.id,
          scripts: {
            channels: strategy.channels || []
          },
          metrics: strategy.metrics_target || {}
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Campaign Created",
        description: `Successfully created campaign from strategy "${strategy.title}"`,
      });
      
      return data;
    } catch (error) {
      toast({
        title: "Campaign Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create campaign from strategy",
        variant: "destructive"
      });
      console.error("Error creating campaign from strategy:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  return { 
    updateCampaignExecutionStatus,
    trackCampaignOutcome,
    getCampaignExecutionMetrics,
    convertStrategyToCampaign,
    isLoading 
  };
}
