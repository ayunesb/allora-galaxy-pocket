
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useCreditsManager } from "@/hooks/useCreditsManager";
import { useCampaignIntegration } from "@/hooks/useCampaignIntegration";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "sonner";
import type { Strategy } from "@/types/strategy";

interface StrategyApprovalFlowProps {
  strategyId: string;
  onApproved?: () => void;
  onDeclined?: () => void;
}

export function StrategyApprovalFlow({ strategyId, onApproved, onDeclined }: StrategyApprovalFlowProps) {
  const { tenant } = useTenant();
  const { useCredits } = useCreditsManager();
  const { convertStrategyToCampaign } = useCampaignIntegration();
  const { sendNotification } = useNotifications();
  const [isApproving, setIsApproving] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [showCampaignPrompt, setShowCampaignPrompt] = useState(false);

  const { data: strategy, isLoading } = useQuery({
    queryKey: ['strategy', strategyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('id', strategyId)
        .single();

      if (error) throw error;
      return data as Strategy;
    },
    enabled: !!strategyId && !!tenant?.id,
  });

  const handleApprove = async () => {
    if (!strategy || !tenant?.id) return;
    
    setIsApproving(true);
    
    try {
      // Update strategy status
      const { error } = await supabase
        .from('strategies')
        .update({ 
          status: 'approved', 
          approved_at: new Date().toISOString() 
        })
        .eq('id', strategy.id);
      
      if (error) throw error;
      
      // Log approval in notifications
      await sendNotification({
        event_type: 'strategy_approval',
        description: `Strategy "${strategy.title}" has been approved and is ready for execution`,
        send_webhook: true
      });
      
      // Log to strategy approval log
      await supabase.from('strategy_approval_log').insert({
        tenant_id: tenant.id,
        strategy_id: strategy.id,
        approved_by: 'Human',
        summary: `Strategy "${strategy.title}" approved by user`
      });
      
      toast.success("Strategy approved", {
        description: "The strategy has been marked as approved"
      });
      
      // Show campaign creation prompt
      setShowCampaignPrompt(true);
      
      if (onApproved) onApproved();
    } catch (error: any) {
      console.error('Error approving strategy:', error);
      toast.error("Failed to approve strategy", {
        description: error.message || "An unexpected error occurred"
      });
    } finally {
      setIsApproving(false);
    }
  };
  
  const handleDecline = async () => {
    if (!strategy || !tenant?.id) return;
    
    setIsDeclining(true);
    
    try {
      // Update strategy status
      const { error } = await supabase
        .from('strategies')
        .update({ 
          status: 'rejected', 
        })
        .eq('id', strategy.id);
      
      if (error) throw error;
      
      // Log rejection in notifications
      await sendNotification({
        event_type: 'strategy_declined',
        description: `Strategy "${strategy.title}" has been declined`,
      });
      
      toast.info("Strategy declined", {
        description: "The strategy has been marked as declined"
      });
      
      if (onDeclined) onDeclined();
    } catch (error: any) {
      console.error('Error declining strategy:', error);
      toast.error("Failed to decline strategy", {
        description: error.message || "An unexpected error occurred"
      });
    } finally {
      setIsDeclining(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!strategy) return;
    
    const success = await convertStrategyToCampaign(
      strategy, 
      ['email', 'social', 'landing_page']
    );
    
    if (success) {
      setShowCampaignPrompt(false);
    }
  };

  if (isLoading || !strategy) {
    return <div>Loading strategy details...</div>;
  }

  if (showCampaignPrompt) {
    return (
      <div className="border rounded-lg p-4 bg-muted/30">
        <h3 className="text-lg font-medium">Create a campaign based on this strategy?</h3>
        <p className="text-sm text-muted-foreground mt-2">
          This will generate campaign assets across multiple channels using AI.
        </p>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={() => setShowCampaignPrompt(false)}>
            Skip
          </Button>
          <Button onClick={handleCreateCampaign} className="gap-2">
            <ArrowRight className="h-4 w-4" />
            Create Campaign
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        onClick={handleDecline} 
        disabled={isDeclining || isApproving}
        className="gap-1 text-destructive hover:text-destructive border-destructive/20 hover:border-destructive"
      >
        <X className="h-4 w-4" />
        Decline
      </Button>
      <Button 
        variant="default" 
        onClick={handleApprove}
        disabled={isDeclining || isApproving}
        className="gap-1"
      >
        <Check className="h-4 w-4" />
        Approve
      </Button>
    </div>
  );
}
