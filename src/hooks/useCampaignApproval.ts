
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AgentFeedback } from '@/types/agent';

export function useCampaignApproval() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { tenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const approveCampaign = async (campaignId: string, feedback?: string) => {
    if (!tenant?.id) {
      throw new Error('No active workspace');
    }
    
    setIsProcessing(true);
    try {
      // Update campaign status to approved
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id);
        
      if (error) throw error;
      
      // Log the approval to agent memory for context
      await supabase.from('agent_memory').insert({
        tenant_id: tenant.id,
        agent_name: 'Marketing',
        context: `Campaign approved by user${feedback ? `: ${feedback}` : ''}`,
        type: 'feedback',
        is_user_submitted: true,
        summary: 'Campaign approval',
        tags: ['campaign', 'approval']
      });
      
      // Add specific feedback record
      const feedbackData: Omit<AgentFeedback, 'id' | 'created_at'> = {
        tenant_id: tenant.id,
        agent: 'Marketing',
        campaign_id: campaignId,
        type: 'approval',
        feedback: feedback || 'Campaign approved'
      };
      
      await supabase.from('agent_feedback')
        .insert(feedbackData);
      
      // Log to system logs for audit trail
      await supabase.from('system_logs').insert({
        tenant_id: tenant.id,
        event_type: 'CAMPAIGN_APPROVED',
        message: `Campaign ${campaignId} was approved`,
        meta: { campaign_id: campaignId, feedback }
      });
      
      return true;
    } catch (error) {
      console.error('Error approving campaign:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const declineCampaign = async (campaignId: string, reason?: string) => {
    if (!tenant?.id) {
      throw new Error('No active workspace');
    }
    
    setIsProcessing(true);
    try {
      // Update campaign status to rejected
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          status: 'rejected',
          failure_reason: reason || 'Declined by user',
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id);
        
      if (error) throw error;
      
      // Log the rejection to agent memory
      await supabase.from('agent_memory').insert({
        tenant_id: tenant.id,
        agent_name: 'Marketing',
        context: `Campaign declined by user. Reason: ${reason || 'Not provided'}`,
        type: 'feedback',
        is_user_submitted: true,
        summary: 'Campaign rejection',
        tags: ['campaign', 'rejection']
      });
      
      // Add specific feedback record
      const feedbackData: Omit<AgentFeedback, 'id' | 'created_at'> = {
        tenant_id: tenant.id,
        agent: 'Marketing',
        campaign_id: campaignId,
        type: 'rejection',
        feedback: reason || 'Campaign declined'
      };
      
      await supabase.from('agent_feedback')
        .insert(feedbackData);
        
      // Log to system logs for audit trail
      await supabase.from('system_logs').insert({
        tenant_id: tenant.id,
        event_type: 'CAMPAIGN_REJECTED',
        message: `Campaign ${campaignId} was rejected`,
        meta: { campaign_id: campaignId, reason }
      });
      
      return true;
    } catch (error) {
      console.error('Error declining campaign:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Create React Query mutations for better loading state management
  const approveMutation = useMutation({
    mutationFn: ({ id, feedback }: { id: string, feedback?: string }) => 
      approveCampaign(id, feedback),
    onSuccess: () => {
      toast({ 
        title: "Campaign approved", 
        description: "Campaign has been approved successfully" 
      });
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['pending-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['agent-feedback'] });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to approve campaign", 
        variant: "destructive" 
      });
    }
  });
  
  const declineMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string, reason?: string }) => 
      declineCampaign(id, reason),
    onSuccess: () => {
      toast({ 
        title: "Campaign declined", 
        description: "Campaign has been declined" 
      });
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['pending-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['agent-feedback'] });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to decline campaign", 
        variant: "destructive" 
      });
    }
  });

  return {
    isProcessing: approveMutation.isPending || declineMutation.isPending,
    approveCampaign: (id: string, feedback?: string) => approveMutation.mutate({ id, feedback }),
    declineCampaign: (id: string, reason?: string) => declineMutation.mutate({ id, reason })
  };
}
