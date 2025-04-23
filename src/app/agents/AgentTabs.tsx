
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AgentPersonaOverview from "./AgentPersonaOverview";
import AgentSkillMatrix from "./AgentSkillMatrix";
import AgentHealthMonitor from "./AgentHealthMonitor";
import { AgentProfile } from "./hooks/useAgentProfile";

export default function AgentTabs({ agent }: { agent: AgentProfile | null }) {
  // Only pass agent to the components that expect AgentProfile.
  // For AgentHealthMonitor, pass array of names (empty if not defined)
  const agentNames = agent && agent.agent_name ? [agent.agent_name] : [];

  return (
    <Tabs defaultValue="overview">
      <TabsList className="mb-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="health">Health</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <AgentPersonaOverview agent={agent} />
      </TabsContent>
      <TabsContent value="skills">
        <AgentSkillMatrix agent={agent} />
      </TabsContent>
      <TabsContent value="health">
        <AgentHealthMonitor agentNames={agentNames} />
      </TabsContent>
    </Tabs>
  );
}
