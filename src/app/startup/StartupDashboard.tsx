
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WelcomeMessage } from "./components/WelcomeMessage";
import { StrategyPreview } from "./components/StrategyPreview";
import { CampaignSuggestions } from "./components/CampaignSuggestions";
import { KpiSnapshot } from "./components/KpiSnapshot";
import { CompetitorAnalysis } from "./components/CompetitorAnalysis";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Strategy } from "@/types/strategy";
import type { Campaign } from "@/types/campaign";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";

export default function StartupDashboard() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const navigate = useNavigate();
  const [welcome, setWelcome] = useState("Welcome back to Allora OS.");
  
  const { data: strategy } = useQuery({
    queryKey: ['latest-strategy', tenant?.id],
    queryFn: async (): Promise<Strategy | null> => {
      if (!tenant?.id) return null;
      
      const { data, error } = await supabase
        .from('vault_strategies')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      
      // Cast and ensure all required fields exist
      return {
        ...data,
        status: data.status as Strategy['status'],
        id: data.id,
        created_at: data.created_at,
        title: data.title || '',
        description: data.description || '',
        // Add default values for potentially missing fields
        tags: data.tags || [],
        goals: data.goals || [],
        channels: data.channels || [],
        kpis: data.kpis || [],
        target_audience: data.target_audience || '',
        reason_for_recommendation: data.reason_for_recommendation || ''
      };
    },
    enabled: !!tenant?.id
  });

  const { data: campaigns } = useQuery({
    queryKey: ['campaign-suggestions', tenant?.id],
    queryFn: async (): Promise<Campaign[]> => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('status', 'draft')
        .limit(3);

      if (error) throw error;
      
      // Cast and ensure all required fields exist
      return (data || []).map(campaign => ({
        ...campaign,
        id: campaign.id,
        name: campaign.name,
        created_at: campaign.created_at,
        updated_at: campaign.updated_at,
        status: campaign.status as Campaign['status']
      }));
    },
    enabled: !!tenant?.id
  });

  // Fetch welcome message
  useEffect(() => {
    if (!tenant?.id) return;
    
    async function fetchWelcomeMessage() {
      const { data: logs, error } = await supabase
        .from('system_logs')
        .select('message')
        .eq('tenant_id', tenant.id)
        .eq('event_type', 'welcome_message')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') console.error('Error fetching welcome message:', error);
        return;
      }

      if (logs?.message) setWelcome(logs.message);
    }

    fetchWelcomeMessage();
  }, [tenant?.id]);

  useEffect(() => {
    if (!user) {
      navigate("/auth/signup");
    }
  }, [user, navigate]);

  if (!user) return null;

  const campaignData = campaigns?.map(c => ({
    channel: c.name.split(' ')[0], // Simple extraction of channel from name
    message: c.name
  })) || [
    { channel: "WhatsApp", message: "Start lead nurturing flow" },
    { channel: "TikTok", message: "Launch awareness video series" },
    { channel: "Email", message: "Schedule re-engagement drip" }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <div className="space-y-6">
          <WelcomeMessage message={welcome} />
          <StrategyPreview strategy={strategy} />
        </div>
        <div className="space-y-6">
          <CampaignSuggestions campaigns={campaignData} />
          <KpiSnapshot />
          <CompetitorAnalysis />
        </div>
      </div>
    </div>
  );
}
