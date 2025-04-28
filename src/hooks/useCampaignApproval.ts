
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/hooks/useTenant';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast as sonnerToast } from 'sonner';

export function useCampaignApproval() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { tenant } = useTenant();
  const queryClient = useQueryClient();

  const approveCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      if (!tenant?.id) throw new Error("No tenant selected");
      
      setIsProcessing(true);
      
      // Update campaign status
      const { error: campaignError } = await supabase
        .from('campaigns')
        .update({ 
          status: 'approved',
          execution_status: 'scheduled',
          updated_at: new Date().toISOString() 
        })
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id);
        
      if (campaignError) throw campaignError;
      
      // Log the approval event
      await supabase.from('system_logs').insert({
        tenant_id: tenant.id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        event_type: 'CAMPAIGN_APPROVED',
        message: `Campaign approved by user`,
        meta: { campaign_id: campaignId }
      });
      
      // Track campaign metric
      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-campaign-metrics`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            campaign_id: campaignId,
            tenant_id: tenant.id,
            metric_type: 'approval',
            value: 1
          })
        });
      } catch (trackError) {
        console.error("Error tracking campaign metrics:", trackError);
      }
      
      return true;
    },
    onSuccess: () => {
      sonnerToast.success("Campaign approved");
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['pending-campaigns'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve campaign",
        variant: "destructive"
      });
      console.error("Campaign approval error:", error);
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  const declineCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      if (!tenant?.id) throw new Error("No tenant selected");
      
      setIsProcessing(true);
      
      // Update campaign status
      const { error: campaignError } = await supabase
        .from('campaigns')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString() 
        })
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id);
        
      if (campaignError) throw campaignError;
      
      // Log the rejection event
      await supabase.from('system_logs').insert({
        tenant_id: tenant.id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        event_type: 'CAMPAIGN_REJECTED',
        message: `Campaign rejected by user`,
        meta: { campaign_id: campaignId }
      });
      
      return true;
    },
    onSuccess: () => {
      sonnerToast.info("Campaign declined");
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['pending-campaigns'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to decline campaign",
        variant: "destructive"
      });
      console.error("Campaign decline error:", error);
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  const approveCampaign = async (campaignId: string) => {
    return approveCampaignMutation.mutateAsync(campaignId);
  };

  const declineCampaign = async (campaignId: string) => {
    return declineCampaignMutation.mutateAsync(campaignId);
  };

  return { 
    approveCampaign, 
    declineCampaign, 
    isProcessing,
    isApproving: approveCampaignMutation.isPending,
    isDeclining: declineCampaignMutation.isPending
  };
}
