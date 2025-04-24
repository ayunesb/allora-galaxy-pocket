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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useKpiAlerts } from "@/hooks/useKpiAlerts";
import { useDataPipeline } from "@/hooks/useDataPipeline";
import { useKpiTracking } from "@/hooks/useKpiTracking";

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
  const { triggerKpiCheck } = useKpiAlerts();
  const { logPipelineEvent } = useDataPipeline();
  const { trackMetric } = useKpiTracking();
  const [isApproving, setIsApproving] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [showCampaignPrompt, setShowCampaignPrompt] = useState(false);
  const [campaignChannels, setCampaignChannels] = useState(['email', 'social']);
  const [showChannelDialog, setShowChannelDialog] = useState(false);

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
      
      // Log pipeline event
      await logPipelineEvent({
        event_type: "strategy_approved",
        source: "strategy",
        target: "campaign",
        metadata: {
          strategy_id: strategy.id,
          strategy_title: strategy.title
        }
      });

      // Track KPI metric
      await trackMetric({
        name: "strategies_approved",
        value: 1,
        metadata: {
          strategy_id: strategy.id,
          industry: strategy.industry
        }
      });

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
      
      // Show channel selection dialog
      setShowChannelDialog(true);
      
      if (onApproved) onApproved();
    } catch (error: any) {
      console.error('Error approving strategy:', error);
      toast.error("Failed to approve strategy", {
        description: error.message || "An unexpected error occurred"
      });
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

  const handleChannelSelect = (value: string) => {
    switch(value) {
      case 'email-social':
        setCampaignChannels(['email', 'social']);
        break;
      case 'email-only':
        setCampaignChannels(['email']);
        break;
      case 'social-only':
        setCampaignChannels(['social']);
        break;
      case 'full-mix':
        setCampaignChannels(['email', 'social', 'landing_page', 'ads']);
        break;
      default:
        setCampaignChannels(['email', 'social']);
    }
  };

  const handleCreateCampaign = async () => {
    if (!strategy) return;
    
    setShowChannelDialog(false);
    setShowCampaignPrompt(true);
    
    const success = await convertStrategyToCampaign(
      strategy, 
      campaignChannels
    );
    
    if (success) {
      // Trigger KPI check to establish baseline metrics
      await triggerKpiCheck(tenant?.id || '');
      
      setShowCampaignPrompt(false);
    }
  };

  const handleSkipCampaign = () => {
    setShowChannelDialog(false);
    setShowCampaignPrompt(false);
    setIsApproving(false);
  };

  if (isLoading || !strategy) {
    return <div className="flex items-center justify-center py-4"><span className="loading loading-spinner"></span></div>;
  }

  if (showCampaignPrompt) {
    return (
      <div className="border rounded-lg p-4 bg-muted/30">
        <h3 className="text-lg font-medium">Creating campaign...</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Generating campaign assets across {campaignChannels.join(', ')} channels using AI.
        </p>
        <div className="flex justify-center mt-4">
          <div className="w-8 h-8 border-t-2 border-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <>
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

      <Dialog open={showChannelDialog} onOpenChange={setShowChannelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select campaign channels</DialogTitle>
            <DialogDescription>
              Choose which channels to use for this strategy-based campaign
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <RadioGroup defaultValue="email-social" onValueChange={handleChannelSelect}>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="email-social" id="email-social" />
                <Label htmlFor="email-social">Email + Social Media</Label>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="email-only" id="email-only" />
                <Label htmlFor="email-only">Email Only</Label>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="social-only" id="social-only" />
                <Label htmlFor="social-only">Social Media Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full-mix" id="full-mix" />
                <Label htmlFor="full-mix">Full Mix (Email, Social, Landing Page, Ads)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleSkipCampaign}>
              Skip Campaign
            </Button>
            <Button onClick={handleCreateCampaign} className="gap-2">
              <ArrowRight className="h-4 w-4" />
              Create Campaign
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
