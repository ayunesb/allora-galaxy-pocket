
import { useEffect, useState } from "react";
import { WelcomeMessage } from "./components/WelcomeMessage";
import { StrategyPreview } from "./components/StrategyPreview";
import { CampaignSuggestions } from "./components/CampaignSuggestions";
import { KpiSnapshot } from "./components/KpiSnapshot";
import { CompetitorAnalysis } from "./components/CompetitorAnalysis";
import { supabase } from "@/integrations/supabase/client";
import type { Strategy } from "@/types/strategy";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";

export default function StartupDashboard() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [welcome, setWelcome] = useState("Welcome back to Allora OS.");
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [campaigns] = useState([
    { channel: "WhatsApp", message: "Start lead nurturing flow" },
    { channel: "TikTok", message: "Launch awareness video series" },
    { channel: "Email", message: "Schedule re-engagement drip" }
  ]);

  useEffect(() => {
    async function fetchLatestStrategy() {
      if (!tenant?.id) return;
      
      try {
        const { data: strategies, error } = await supabase
          .from('vault_strategies')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;
        if (strategies) setStrategy(strategies);

        const { data: logs } = await supabase
          .from('system_logs')
          .select('message')
          .eq('tenant_id', tenant.id)
          .eq('event_type', 'welcome_message')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (logs?.message) setWelcome(logs.message);
      } catch (error) {
        console.error('Error fetching strategy:', error);
      }
    }

    fetchLatestStrategy();
  }, [tenant?.id]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <div className="space-y-6">
          <WelcomeMessage message={welcome} />
          <StrategyPreview strategy={strategy} />
        </div>
        <div className="space-y-6">
          <CampaignSuggestions campaigns={campaigns} />
          <KpiSnapshot />
          <CompetitorAnalysis />
        </div>
      </div>
    </div>
  );
}
