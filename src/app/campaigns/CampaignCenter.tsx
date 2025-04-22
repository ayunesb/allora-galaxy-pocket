
import { useState } from "react";
import { CampaignHeader } from "./components/CampaignHeader";
import { ScriptCard } from "./components/ScriptCard";
import { ActionButtons } from "./components/ActionButtons";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function CampaignCenter() {
  const [approved, setApproved] = useState(false);
  const { toast } = useToast();
  const { tenant } = useTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['current-campaign', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return null;

      // Get latest campaign
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      // Get related campaign scripts
      const { data: scripts, error: scriptsError } = await supabase
        .from('campaign_scripts')
        .select('*')
        .eq('campaign_id', data.id);

      if (scriptsError) throw scriptsError;

      return {
        ...data,
        scripts: scripts ? scripts.reduce((acc: Record<string, string>, curr: any) => {
          // Fix type issue by ensuring curr.channel and curr.content are strings
          if (typeof curr.channel === 'string' && curr.content !== null) {
            acc[curr.channel] = String(curr.content); // Ensure it's converted to string
          }
          return acc;
        }, {}) : {}
      };
    },
    enabled: !!tenant?.id
  });

  const handleApprove = async () => {
    if (!campaign || !tenant?.id || !user?.id) return;
    
    try {
      // Update campaign status
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({ status: 'active' })
        .eq('id', campaign.id);
        
      if (updateError) throw updateError;

      // Record feedback
      const { error: feedbackError } = await supabase
        .from('strategy_feedback')
        .insert({
          tenant_id: tenant.id,
          user_id: user.id,
          strategy_title: campaign.name,
          action: 'used'
        });
        
      if (feedbackError) throw feedbackError;

      setApproved(true);
      toast({
        title: "Campaign Approved",
        description: "AI system is deploying all tasks now..."
      });
      
      // Refresh related queries
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-campaigns-count'] });
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
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );
  }

  // Fallback to mock data if no campaigns found
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
    <div className="container mx-auto p-6 space-y-6">
      <CampaignHeader title={campaignData.name} description={campaignData.description} />
      
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(campaignData.scripts).map(([channel, script]) => (
          <ScriptCard key={channel} channel={channel} script={script} />
        ))}
      </div>

      <ActionButtons 
        onApprove={handleApprove} 
        approved={approved} 
      />
    </div>
  );
}
