
import { useState } from 'react';
import { useTenant } from './useTenant';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';
import { useSystemLogs } from './useSystemLogs';
import type { Strategy } from '@/types/strategy';
import { toast as sonnerToast } from 'sonner';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CampaignService } from '@/services/CampaignService';

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
      const input = {
        name: `Campaign based on: ${strategy.title}`,
        description: strategy.description,
        strategyId: strategy.id,
        channels: channels || strategy.channels || ["email", "social"],
        audience: strategy.target_audience
      };
      
      // Generate campaign scripts
      const result = await CampaignService.generateCampaign(input, tenant.id, strategy);
      if (!result.success) {
        throw new Error(result.error || "Failed to generate campaign");
      }
      
      // Save the campaign
      const saveResult = await CampaignService.saveCampaign(result.data, input, tenant.id);
      if (!saveResult.success) {
        throw new Error(saveResult.error || "Failed to save campaign");
      }

      await logActivity({
        event_type: 'campaign_created',
        message: `Campaign created from strategy: ${strategy.title}`,
        meta: {
          strategy_id: strategy.id,
          campaign_id: saveResult.data.id
        }
      });

      toast({
        title: "Campaign created",
        description: "Strategy successfully converted to campaign draft"
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });

      return true;
    } catch (err: any) {
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
    if (!tenant?.id) return false;
    
    try {
      const result = await CampaignService.updateCampaignExecution(
        campaignId, 
        tenant.id, 
        data.status, 
        data.metrics
      );
      
      if (!result.success) {
        throw new Error(result.error || "Failed to update campaign execution");
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['campaign-detail', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      
      return true;
    } catch (error) {
      console.error("Error updating campaign execution:", error);
      return false;
    }
  };

  const updateCampaignExecutionStatus = async (
    campaignId: string, 
    status: string, 
    metrics?: Record<string, any>
  ) => {
    if (!tenant?.id) return false;

    try {
      const result = await CampaignService.updateCampaignExecution(
        campaignId,
        tenant.id,
        status,
        metrics
      );
      
      if (!result.success) {
        throw new Error(result.error);
      }

      await logActivity({
        event_type: 'campaign_status_updated',
        message: `Campaign execution status updated to: ${status}`,
        meta: {
          campaign_id: campaignId,
          status,
          metrics
        }
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-detail', campaignId] });
      
      return true;
    } catch (err: any) {
      console.error('Error updating campaign status:', err);
      sonnerToast.error('Error updating campaign status');
      return false;
    }
  };

  const getCampaignExecutionMetrics = async (campaignId: string) => {
    if (!tenant?.id) return null;

    try {
      const result = await CampaignService.getCampaignExecutionMetrics(campaignId, tenant.id);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (err: any) {
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
    if (!tenant?.id || !user?.id) return false;
    
    try {
      const result = await CampaignService.trackCampaignOutcome(
        campaignId,
        tenant.id,
        user.id,
        outcomeType,
        outcomeValue,
        outcomeDetails
      );
      
      if (!result.success) {
        throw new Error(result.error);
      }

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
    } catch (err: any) {
      console.error('Error tracking campaign outcome:', err);
      toast({
        title: "Error",
        description: "Failed to track campaign outcome",
        variant: "destructive"
      });
      return false;
    }
  };
  
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
      const result = await CampaignService.generateCampaignReport(campaignId, tenant.id);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (err: any) {
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
