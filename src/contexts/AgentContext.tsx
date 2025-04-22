
import React, { createContext, useContext, ReactNode } from "react";
import { useAgentContext as useAgentData } from "@/hooks/useAgentContext";
import { AgentProfile } from "@/app/agents/hooks/useAgentProfile";

interface AgentContextType {
  agentProfile: AgentProfile | null;
  isLoading: boolean;
  getAgentSystemPrompt: () => string;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider = ({ children }: { children: ReactNode }) => {
  const { agentProfile, isLoading, getAgentSystemPrompt } = useAgentData();

  return (
    <AgentContext.Provider value={{ agentProfile, isLoading, getAgentSystemPrompt }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgentContext = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error("useAgentContext must be used within an AgentProvider");
  }
  return context;
};
