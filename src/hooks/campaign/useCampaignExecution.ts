
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { toast } from "sonner";
import { useQueryClient } from '@tanstack/react-query';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { Campaign } from '@/types/campaign';

export function useCampaignExecution() {
  const [isLoading, setIsLoading] = useState(false);
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const { logActivity } = useSystemLogs();

  /**
   * Start or resume campaign execution
   */
  const startCampaignExecution = async (campaignId: string) => {
    if (!tenant?.id) return false;
    setIsLoading(true);
    
    try {
      // First check if the campaign exists and belongs to this tenant
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id)
        .single();
      
      if (campaignError || !campaign) {
        throw new Error('Campaign not found or access denied');
      }
      
      // Update campaign status to running
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({
          execution_status: 'in_progress',
          execution_start_date: campaign.execution_start_date || new Date().toISOString(),
          execution_metrics: {
            ...(campaign.execution_metrics || {}),
            last_tracked: new Date().toISOString()
          }
        })
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id);
      
      if (updateError) throw updateError;
      
      // Log the activity
      await logActivity({
        event_type: 'campaign_execution_started',
        message: `Campaign execution started: ${campaign.name}`,
        meta: {
          campaign_id: campaignId,
          campaign_name: campaign.name
        }
      });
      
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      
      toast({
        description: "Campaign execution started"
      });
      
      return true;
    } catch (error: any) {
      console.error('Error starting campaign execution:', error);
      toast({
        description: `Failed to start campaign: ${error.message}`
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Pause campaign execution
   */
  const pauseCampaignExecution = async (campaignId: string) => {
    if (!tenant?.id) return false;
    setIsLoading(true);
    
    try {
      // Update campaign status to paused
      const { data: campaign, error: updateError } = await supabase
        .from('campaigns')
        .update({ execution_status: 'paused' })
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      // Log the activity
      await logActivity({
        event_type: 'campaign_execution_paused',
        message: `Campaign execution paused: ${campaign.name}`,
        meta: {
          campaign_id: campaignId,
          campaign_name: campaign.name
        }
      });
      
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      
      toast({
        description: "Campaign execution paused"
      });
      
      return true;
    } catch (error: any) {
      console.error('Error pausing campaign execution:', error);
      toast({
        description: `Failed to pause campaign: ${error.message}`
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Complete campaign execution
   */
  const completeCampaignExecution = async (campaignId: string) => {
    if (!tenant?.id) return false;
    setIsLoading(true);
    
    try {
      // Update campaign status to completed
      const { data: campaign, error: updateError } = await supabase
        .from('campaigns')
        .update({ execution_status: 'completed' })
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      // Log the activity
      await logActivity({
        event_type: 'campaign_execution_completed',
        message: `Campaign execution completed: ${campaign.name}`,
        meta: {
          campaign_id: campaignId,
          campaign_name: campaign.name
        }
      });
      
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      
      toast({
        description: "Campaign execution completed"
      });
      
      return true;
    } catch (error: any) {
      console.error('Error completing campaign execution:', error);
      toast({
        description: `Failed to complete campaign: ${error.message}`
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update campaign metrics
   */
  const updateCampaignMetrics = async (campaignId: string, metrics: Record<string, any>) => {
    if (!tenant?.id) return false;
    
    try {
      // Get current campaign metrics
      const { data: campaign, error: getError } = await supabase
        .from('campaigns')
        .select('execution_metrics')
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id)
        .single();
      
      if (getError) throw getError;
      
      // Merge with new metrics
      const updatedMetrics = {
        ...(campaign.execution_metrics || {}),
        ...metrics,
        last_tracked: new Date().toISOString()
      };
      
      // Update campaign metrics
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({ execution_metrics: updatedMetrics })
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id);
      
      if (updateError) throw updateError;
      
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      
      return true;
    } catch (error) {
      console.error('Error updating campaign metrics:', error);
      return false;
    }
  };

  /**
   * Get campaign execution details
   */
  const getCampaignExecutionDetails = async (campaignId: string): Promise<Campaign | null> => {
    if (!tenant?.id) return null;
    
    try {
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id)
        .single();
      
      if (error) throw error;
      
      return campaign;
    } catch (error) {
      console.error('Error getting campaign execution details:', error);
      return null;
    }
  };

  return {
    isLoading,
    startCampaignExecution,
    pauseCampaignExecution,
    completeCampaignExecution,
    updateCampaignMetrics,
    getCampaignExecutionDetails
  };
}
