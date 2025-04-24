
import React from "react";
import { useCampaignIntegration } from "@/hooks/useCampaignIntegration";
import { DashboardHeader } from "./components/DashboardHeader";
import { KPISection } from "./components/KPISection";
import { StrategySection } from "./components/StrategySection";
import { CampaignSection } from "./components/CampaignSection";
import { useStrategyAndCampaigns } from "./hooks/useStrategyAndCampaigns";

export default function DashboardPage() {
  const { trackCampaignOutcome } = useCampaignIntegration();
  const { strategies, campaigns } = useStrategyAndCampaigns();

  React.useEffect(() => {
    if (campaigns && campaigns.length > 0) {
      const activeCampaigns = campaigns.filter(camp => camp.status === 'active');
      
      for (const campaign of activeCampaigns) {
        trackCampaignOutcome(
          campaign.id, 
          'execution_check',
          1,
          { status: campaign.status }
        );
      }
    }
  }, [campaigns, trackCampaignOutcome]);

  return (
    <div className="container mx-auto p-6">
      <DashboardHeader />
      <KPISection />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <StrategySection strategies={strategies} />
        <CampaignSection campaigns={campaigns} />
      </div>
    </div>
  );
}
