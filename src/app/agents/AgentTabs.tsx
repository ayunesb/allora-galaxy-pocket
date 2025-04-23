
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AgentPersonaOverview from "./AgentPersonaOverview";
import AgentSkillMatrix from "./AgentSkillMatrix";
import AgentHealthMonitor from "./AgentHealthMonitor";
// import AgentXPTracker from "./AgentXPTracker" // phase 2 if desired

export default function AgentTabs({ agentNames }: { agentNames: string[] }) {
  return (
    <Tabs defaultValue="overview">
      <TabsList className="mb-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="health">Health</TabsTrigger>
        {/* <TabsTrigger value="xp">XP</TabsTrigger> */}
      </TabsList>
      <TabsContent value="overview">
        <AgentPersonaOverview agent={agentNames[0]} />
      </TabsContent>
      <TabsContent value="skills">
        <AgentSkillMatrix agent={agentNames[0]} />
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
