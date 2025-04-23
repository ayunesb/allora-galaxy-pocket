
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AgentPersonaOverview from "./AgentPersonaOverview";
import AgentSkillMatrix from "./AgentSkillMatrix";
import AgentHealthMonitor from "./AgentHealthMonitor";
import { AgentProfile } from "./hooks/useAgentProfile";
// import AgentXPTracker from "./AgentXPTracker" // phase 2 if desired

export default function AgentTabs({ agent }: { agent: AgentProfile | null }) {
  // Create agent names array from the single agent for AgentHealthMonitor
  // Ensure we only add the agent_name if agent exists
  const agentNames = agent ? [agent.agent_name] : [];

  return (
    <Tabs defaultValue="overview">
      <TabsList className="mb-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="health">Health</TabsTrigger>
        {/* <TabsTrigger value="xp">XP</TabsTrigger> */}
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
      {/* <TabsContent value="xp">
        <AgentXPTracker agent={agent} />
      </TabsContent> */}
    </Tabs>
  );
}
