
import React from "react";
import { useCampaignIntegration } from "@/hooks/useCampaignIntegration";

export default function CampaignPerformancePage() {
  const { trackCampaignOutcome } = useCampaignIntegration();
  const campaignId = "example-campaign-id";

  React.useEffect(() => {
    trackCampaignOutcome(
      campaignId,
      'performance_check',
      1,
      { metric: 'roi' }
    );
  }, [campaignId, trackCampaignOutcome]);

  return (
    <div>
      <h1>Campaign Performance Dashboard</h1>
      <p>Tracking performance for campaign ID: {campaignId}</p>
    </div>
  );
}
