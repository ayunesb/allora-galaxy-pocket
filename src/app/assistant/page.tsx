
import React from "react";
import AssistantPanel from "./AssistantPanel";
import { AgentProvider } from "@/contexts/AgentContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function AssistantPage() {
  return (
    <ErrorBoundary>
      <AgentProvider>
        <AssistantPanel />
      </AgentProvider>
    </ErrorBoundary>
  );
}
