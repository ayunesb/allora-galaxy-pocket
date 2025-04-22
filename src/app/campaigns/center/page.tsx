
import React from "react";
import CampaignCenter from "@/app/campaigns/CampaignCenter";
import { AgentProvider } from "@/contexts/AgentContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function CampaignCenterPage() {
  return (
    <ErrorBoundary>
      <AgentProvider>
        <CampaignCenter />
      </AgentProvider>
    </ErrorBoundary>
  );
}
