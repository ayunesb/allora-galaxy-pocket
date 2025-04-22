
import React from "react";
import { useParams } from "react-router-dom";
import { AgentProvider } from "@/contexts/AgentContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import CampaignDetail from "./components/CampaignDetail";

export default function CampaignDetailPage() {
  const { id } = useParams();
  
  return (
    <ErrorBoundary>
      <AgentProvider>
        <CampaignDetail id={id} />
      </AgentProvider>
    </ErrorBoundary>
  );
}
