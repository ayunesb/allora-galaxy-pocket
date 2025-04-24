
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';
import { useSystemLogs } from './useSystemLogs';
import type { Strategy } from '@/types/strategy';
import { toast as sonnerToast } from 'sonner';
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useCampaignIntegration() {
  const [isLoading, setIsLoading] = useState(false);
  const { tenant } = useTenant();
  const { toast } = useToast();
  const { user } = useAuth();
  const { logActivity } = useSystemLogs();
  const queryClient = useQueryClient();

  const convertStrategyToCampaign = async (strategy: Strategy, channels?: string[]) => {
    if (!tenant?.id || !strategy?.id) {
      toast({
        title: "Error",
        description: "Missing tenant or strategy information",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);
    try {
      const scripts: Record<string, string> = {};
      if (channels?.length) {
        channels.forEach(channel => {
          scripts[channel.toLowerCase()] = `${channel} script will be generated...`;
        });
      } else {
        scripts.email = "Draft email script...";
        scripts.social = "Draft social media post...";
      }

      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          name: `Campaign based on: ${strategy.title}`,
          description: strategy.description,
          status: 'draft',
          tenant_id: tenant.id,
          scripts,
          strategy_id: strategy.id,
          execution_status: 'pending',
          execution_metrics: {
            views: 0,
            clicks: 0,
            conversions: 0,
            last_updated: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (error) throw error;

      await logActivity({
        event_type: 'campaign_created',
        message: `Campaign created from strategy: ${strategy.title}`,
        meta: {
          strategy_id: strategy.id,
          campaign_id: data.id
        }
      });

      toast({
        title: "Campaign created",
        description: "Strategy successfully converted to campaign draft"
      });

      return true;
    } catch (err) {
      console.error('Error creating campaign:', err);
      toast({
        title: "Error",
        description: "Failed to create campaign from strategy",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCampaignExecution = async (campaignId: string, data: any) => {
    // Note: execution_start_date added to update
    const { error } = await supabase
      .from('campaigns')
      .update({
        execution_metrics: data.metrics,
        execution_status: data.status,
        execution_start_date: data.execution_start_date || new Date().toISOString()
      })
      .eq('id', campaignId);

    if (error) throw error;

    // Invalidate queries
    queryClient.invalidateQueries({ queryKey: ['campaign-detail', campaignId] });
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
  };

  const updateCampaignExecutionStatus = async (
    campaignId: string, 
    status: string, 
    metrics?: Record<string, any>
  ) => {
    if (!tenant?.id) return false;

    try {
      // Get current metrics before updating
      const { data: campaignData, error: fetchError } = await supabase
        .from('campaigns')
        .select('execution_metrics, execution_start_date')
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Merge existing metrics with new metrics
      const existingMetrics = campaignData.execution_metrics || {};
      const updatedMetrics = {
        ...existingMetrics,
        ...(metrics || {}),
        last_updated: new Date().toISOString()
      };
      
      // Add execution start date if starting campaign
      const executionStartDate = status === 'running' && !campaignData.execution_start_date
        ? { execution_start_date: new Date().toISOString() }
        : {};
        
      // Update campaign with new status and metrics
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          execution_status: status, 
          execution_metrics: updatedMetrics,
          ...executionStartDate
        })
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id);

      if (error) throw error;

      await logActivity({
        event_type: 'campaign_status_updated',
        message: `Campaign execution status updated to: ${status}`,
        meta: {
          campaign_id: campaignId,
          status,
          metrics
        }
      });
      
      return true;
    } catch (err) {
      console.error('Error updating campaign status:', err);
      sonnerToast.error('Error updating campaign status');
      return false;
    }
  };

  const getCampaignExecutionMetrics = async (campaignId: string) => {
    if (!tenant?.id) return null;

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('execution_metrics, execution_status, execution_start_date')
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id)
        .single();

      if (error) throw error;
      
      return data;
    } catch (err) {
      console.error('Error fetching campaign metrics:', err);
      return null;
    }
  };

  const trackCampaignOutcome = async (
    campaignId: string,
    outcomeType: string,
    outcomeValue: number,
    outcomeDetails?: Record<string, any>
  ) => {
    if (!tenant?.id) return false;
    
    try {
      // First update the campaign's execution metrics
      const { data: campaign, error: fetchError } = await supabase
        .from('campaigns')
        .select('execution_metrics')
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Create new metrics object with updated values
      const currentMetrics = campaign.execution_metrics || {};
      const updatedMetrics = {
        ...currentMetrics,
        [outcomeType]: (currentMetrics[outcomeType] || 0) + outcomeValue,
        last_updated: new Date().toISOString()
      };
      
      // Update campaign metrics
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({
          execution_metrics: updatedMetrics
        })
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id);
        
      if (updateError) throw updateError;
      
      // Insert record into campaign_outcomes table
      const { error } = await supabase
        .from('campaign_outcomes')
        .insert({
          campaign_id: campaignId,
          tenant_id: tenant.id,
          outcome_type: outcomeType,
          outcome_value: outcomeValue,
          details: outcomeDetails || {},
          recorded_by: user?.id
        });

      if (error) throw error;

      await logActivity({
        event_type: 'campaign_outcome_recorded',
        message: `Recorded ${outcomeType} outcome for campaign`,
        meta: {
          campaign_id: campaignId,
          outcome_type: outcomeType,
          outcome_value: outcomeValue
        }
      });

      return true;
    } catch (err) {
      console.error('Error tracking campaign outcome:', err);
      toast({
        title: "Error",
        description: "Failed to track campaign outcome",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // New method for generating a report on campaign performance
  const generateCampaignReport = async (campaignId: string) => {
    if (!tenant?.id) {
      toast({
        title: "Error",
        description: "Missing tenant information",
        variant: "destructive"
      });
      return null;
    }
    
    setIsLoading(true);
    try {
      // Use the predict-campaign-performance function
      const { data, error } = await supabase.functions.invoke('predict-campaign-performance', {
        body: {
          campaign_id: campaignId,
          tenant_id: tenant.id
        }
      });
      
      if (error) throw error;
      
      return data;
    } catch (err) {
      console.error('Error generating campaign report:', err);
      toast({
        title: "Error", 
        description: "Failed to generate campaign report",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    convertStrategyToCampaign,
    updateCampaignExecution,
    updateCampaignExecutionStatus,
    getCampaignExecutionMetrics,
    trackCampaignOutcome,
    generateCampaignReport
  };
}
