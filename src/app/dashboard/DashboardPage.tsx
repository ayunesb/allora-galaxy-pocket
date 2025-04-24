
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useCampaignIntegration } from "@/hooks/useCampaignIntegration";
import { Card, CardContent } from "@/components/ui/card";
import { KPITrackerWithData } from "@/components/KPITracker";
import { KpiCampaignTracker } from "@/components/KpiCampaignTracker";
import { StrategySection } from "./components/StrategySection";
import { CampaignSection } from "./components/CampaignSection";

export default function DashboardPage() {
  const { tenant } = useTenant();
  const { trackCampaignOutcome } = useCampaignIntegration();

  const { data: strategies } = useQuery({
    queryKey: ["strategies", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from("strategies")
        .select("*")
        .eq("tenant_id", tenant.id)
        .limit(5);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant?.id,
  });

  const { data: campaigns } = useQuery({
    queryKey: ["campaigns", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("tenant_id", tenant.id)
        .limit(5);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant?.id,
  });

  React.useEffect(() => {
    if (campaigns && campaigns.length > 0) {
      const activeCampaigns = campaigns.filter(camp => camp.status === 'active');
      
      for (const campaign of activeCampaigns) {
        trackCampaignOutcome(campaign.id);
      }
    }
  }, [campaigns, trackCampaignOutcome]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <KPITrackerWithData />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <KpiCampaignTracker />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <StrategySection strategies={strategies} />
        <CampaignSection campaigns={campaigns} />
      </div>
    </div>
  );
}
