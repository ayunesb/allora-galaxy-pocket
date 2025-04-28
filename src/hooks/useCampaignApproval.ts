
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCampaignApproval() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { tenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const approveCampaign = async (campaignId: string) => {
    if (!tenant?.id) {
      throw new Error('No active workspace');
    }
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: 'approved' })
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id);
        
      if (error) throw error;
      
      // Log the approval to agent memory
      await supabase.from('agent_memory').insert({
        tenant_id: tenant.id,
        agent_name: 'Marketing',
        context: `Campaign approved by user`,
        type: 'feedback',
        is_user_submitted: true
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
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          status: 'rejected',
          failure_reason: reason || 'Declined by user'
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
        is_user_submitted: true
      });
      
      return true;
    } catch (error) {
      console.error('Error declining campaign:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const approveMutation = useMutation({
    mutationFn: approveCampaign,
    onSuccess: () => {
      toast({ title: "Campaign approved", description: "Campaign has been approved successfully" });
      queryClient.invalidateQueries({ queryKey: ['pending-campaigns'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve campaign", variant: "destructive" });
    }
  });
  
  const declineMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string, reason?: string }) => declineCampaign(id, reason),
    onSuccess: () => {
      toast({ title: "Campaign declined", description: "Campaign has been declined" });
      queryClient.invalidateQueries({ queryKey: ['pending-campaigns'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to decline campaign", variant: "destructive" });
    }
  });

  return {
    isProcessing: approveMutation.isPending || declineMutation.isPending,
    approveCampaign: (id: string) => approveMutation.mutate(id),
    declineCampaign: (id: string, reason?: string) => declineMutation.mutate({ id, reason })
  };
}
