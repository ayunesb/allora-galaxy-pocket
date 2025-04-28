
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AgentPersonaOverview from "./AgentPersonaOverview";
import AgentSkillMatrix from "./AgentSkillMatrix";
import AgentHealthMonitor from "./AgentHealthMonitor";
import { AgentProfile } from "@/types/agent";

interface AgentTabsProps {
  agent: AgentProfile | null;
}

export default function AgentTabs({ agent }: AgentTabsProps) {
  // Only pass agent to the components that expect AgentProfile.
  // For AgentHealthMonitor, pass agentName (empty if agent not defined)
  const agentName = agent?.agent_name || "";

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
        <AgentHealthMonitor agentName={agentName} />
      </TabsContent>
    </Tabs>
  );
}
