
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';
import { useToast } from './use-toast';
import { useAuth } from './useAuth';
import { useSystemLogs } from './useSystemLogs';
import type { Strategy } from '@/types/strategy';

export function useCampaignIntegration() {
  const [isLoading, setIsLoading] = useState(false);
  const { tenant } = useTenant();
  const { toast } = useToast();
  const { user } = useAuth();
  const { logActivity } = useSystemLogs();

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
      // Create default scripts based on channels or use generic placeholders
      const scripts: Record<string, string> = {};
      if (channels?.length) {
        channels.forEach(channel => {
          scripts[channel.toLowerCase()] = `${channel} script will be generated...`;
        });
      } else {
        scripts.email = "Draft email script...";
        scripts.social = "Draft social media post...";
      }

      // Insert new campaign
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          name: `Campaign based on: ${strategy.title}`,
          description: strategy.description,
          status: 'draft',
          tenant_id: tenant.id,
          scripts,
          strategy_id: strategy.id
        })
        .select()
        .single();

      if (error) throw error;

      // Log campaign creation activity
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

  const updateCampaignExecutionStatus = async (
    campaignId: string, 
    status: string, 
    metrics?: Record<string, any>
  ) => {
    if (!tenant?.id) return false;

    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          execution_status: status, 
          execution_start_date: status === 'running' ? new Date().toISOString() : undefined,
          execution_metrics: metrics || undefined
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
      return false;
    }
  };

  const getCampaignExecutionMetrics = async (campaignId: string) => {
    if (!tenant?.id) return null;

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('execution_metrics')
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id)
        .single();

      if (error) throw error;
      
      return data.execution_metrics;
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

      // Log the outcome tracking
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

  return {
    isLoading,
    convertStrategyToCampaign,
    updateCampaignExecutionStatus,
    getCampaignExecutionMetrics,
    trackCampaignOutcome
  };
}
