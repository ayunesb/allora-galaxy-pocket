
"use client";

import { useState, useCallback } from "react";
import { useTenant } from "@/hooks/useTenant";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { PromptPerformanceStats } from "../components/PromptPerformanceStats";
import { useAgentStats } from "./hooks/useAgentStats";
import { useAgentAlerts } from "./hooks/useAgentAlerts";
import { AgentPerformanceChart } from "./AgentPerformanceChart";
import { AgentSelector } from "./AgentSelector";
import { AgentSummaryCard } from "./AgentSummaryCard";

export default function AgentPerformanceDashboard() {
  const stats = useAgentStats();
  const alerts = useAgentAlerts();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const [selectedAgent, setSelectedAgent] = useState<string>("");

  const adjustAgentXP = useCallback(
    async (agent: string, delta: number) => {
      if (!tenant?.id) return;

      const { error } = await (await import("@/integrations/supabase/client")).supabase
        .from("agent_memory")
        .insert({
          agent_name: agent,
          type: "feedback",
          context: `Manual XP adjustment: ${delta}`,
          xp_delta: delta,
          tenant_id: tenant.id,
        });

      if (error) {
        toast({
          title: "XP Adjustment Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "XP Adjusted",
          description: `${agent} received ${delta} XP`
        });
      }
    },
    [tenant?.id, toast]
  );

  const rateAgentTask = useCallback(
    async (agent: string, rating: number) => {
      if (!tenant?.id) return;

      const { error } = await (await import("@/integrations/supabase/client")).supabase
        .from("agent_feedback")
        .insert({
          agent,
          rating,
          type: "task_rating",
          tenant_id: tenant.id,
        });

      if (error) {
        toast({
          title: "Rating Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Task Rated",
          description: `${agent} rated ${rating}/5 stars`
        });
      }
    },
    [tenant?.id, toast]
  );

  const submitPromptFeedback = useCallback(
    async (agent: string, feedback: string) => {
      if (!tenant?.id || !feedback.trim()) return;

      const { error } = await (await import("@/integrations/supabase/client")).supabase
        .from("agent_feedback")
        .insert({
          agent,
          type: "prompt_feedback",
          feedback,
          tenant_id: tenant.id,
        });

      if (error) {
        toast({
          title: "Prompt Feedback Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Prompt Feedback Submitted",
          description: `Feedback for ${agent} sent successfully`
        });
      }
    },
    [tenant?.id, toast]
  );

  const uniqueAgents = [...new Set(stats.map((s) => s.agent))];

  // When we have stats but no selected agent, default to the first one
  if (uniqueAgents.length > 0 && !selectedAgent) {
    setSelectedAgent(uniqueAgents[0]);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        <span role="img" aria-label="Performance">📈</span> Agent Performance Dashboard
      </h1>

      {alerts.length > 0 && (
        <div className="mb-6">
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTitle>Prompt Version Recommendations</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 space-y-1">
                {alerts.map((alert) => (
                  <li key={alert.id} className="flex items-center justify-between">
                    <span>{alert.message}</span>
                    <a
                      href={`/agents/versions/compare/${alert.agent}`}
                      className="text-primary hover:underline text-sm"
                    >
                      🔍 Compare Versions
                    </a>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <AgentPerformanceChart stats={stats} />

      <AgentSelector
        agents={uniqueAgents}
        selectedAgent={selectedAgent}
        onChange={setSelectedAgent}
      />

      {selectedAgent && (
        <div className="mb-6">
          <PromptPerformanceStats agentName={selectedAgent} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {uniqueAgents.map((agent) => {
          const agentData = stats.filter((d) => d.agent === agent);
          return (
            <AgentSummaryCard
              key={agent}
              agent={agent}
              agentData={agentData}
              adjustAgentXP={adjustAgentXP}
              rateAgentTask={rateAgentTask}
              submitPromptFeedback={submitPromptFeedback}
            />
          );
        })}
      </div>
    </div>
  );
}
