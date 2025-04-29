import { useState } from "react";
import { CampaignHeader } from "./components/CampaignHeader";
import { ScriptCard } from "./components/ScriptCard";
import { ActionButtons } from "./components/ActionButtons";
import { AgentInfoCard } from "./components/AgentInfoCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAgentContext } from "@/contexts/AgentContext";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { Campaign } from "@/types/campaign";
import { CreditCheck } from "@/components/billing/CreditCheck";

export default function CampaignCenter() {
  const [approved, setApproved] = useState(false);
  const { toast } = useToast();
  const { tenant } = useTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { agentProfile } = useAgentContext();
  const { logActivity } = useSystemLogs();

  const { data: campaign, isLoading, error, refetch } = useQuery({
    queryKey: ['current-campaign', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return null;

      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('tenant_id', tenant.id)
          .eq('status', 'draft')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return null; // No draft campaign found
          console.error("Error fetching campaign:", error);
          throw error;
        }

        return data as Campaign;
      } catch (err) {
        console.error("Error in campaign query:", err);
        throw err;
      }
    },
    enabled: !!tenant?.id,
    retry: 1
  });

  const handleApprove = async () => {
    if (!campaign || !tenant?.id || !user?.id) {
      toast({
        title: "Error",
        description: "Missing required information to approve the campaign",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const updatePayload = {
        status: 'active',
        ...(agentProfile && { generated_by_agent_id: agentProfile.id })
      };
      
      const { error: updateError } = await supabase
        .from('campaigns')
        .update(updatePayload)
        .eq('id', campaign.id);
        
      if (updateError) throw updateError;

      setApproved(true);
      toast({
        title: "Campaign Approved",
        description: "AI system is deploying all tasks now..."
      });
      
      const agentInfo = agentProfile 
        ? { agent_id: agentProfile.id, agent_name: agentProfile.agent_name }
        : {};
        
      await logActivity(
        "campaign_approved",
        `Campaign "${campaign.name}" approved${agentProfile ? ` using agent ${agentProfile.agent_name}` : ''}`,
        { 
          campaign_id: campaign.id,
          campaign_name: campaign.name,
          ...agentInfo
        },
        'info'
      );
      
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    } catch (error) {
      console.error('Error approving campaign:', error);
      toast({
        title: "Error",
        description: "Failed to approve campaign. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center">
        <Loader2 className="animate-spin h-6 w-6 mr-2" />
        <span>Loading campaign data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error loading campaign</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => refetch()}
          variant="outline"
          size="sm"
        >
          Retry
        </Button>
      </div>
    );
  }

  const campaignData = campaign || {
    name: "Q2 Launch Plan",
    description: "AI-generated strategy for increasing awareness via TikTok and nurturing via WhatsApp.",
    scripts: {
      whatsapp: "Hey {{first_name}}, we just launched something amazing. Want early access?",
      email: "Subject: Launch 🚀 | Body: We've built something for teams like yours...",
      tiktok: "Create a 10s hook explaining the pain point, then show a demo or transformation.",
      meta: "Carousel Ad: Slide 1 = problem, Slide 2 = solution, Slide 3 = CTA",
      cold_call: "Hi, I'm calling because I saw you sell online — would you be open to a quick growth idea?",
      warm_call: "We connected last week. I have a launch ready if you're still interested!",
      zoom: "Training deck on 'Handling objections' is scheduled for Friday @ 11am with AI coach"
    }
  };

  return (
    <CreditCheck requiredCredits={10}>
      <div className="container mx-auto p-6 space-y-6">
        <AgentInfoCard />
        <CampaignHeader title={campaignData.name} description={campaignData.description} />
        
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(campaignData.scripts || {}).map(([channel, script]) => (
            <ScriptCard 
              key={channel} 
              channel={channel} 
              script={String(script)}
            />
          ))}
        </div>

        <ActionButtons 
          onApprove={handleApprove} 
          approved={approved} 
        />
      </div>
    </CreditCheck>
  );
}
