
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AgentBlueprint {
  id: string;
  agent_name: string;
  mission: string;
  personas: string[];
  capabilities: string[];
  task_type: string;
  output_schema: string;
  prompt: string;
  created_at: string;
}

const downloadAgentFile = (agent: AgentBlueprint) => {
  const content = `// AUTO-GENERATED AGENT: ${agent.agent_name}
export const ${agent.agent_name}_Agent = {
  name: "${agent.agent_name}",
  mission: "${agent.mission}",
  personas: ${JSON.stringify(agent.personas)},
  capabilities: ${JSON.stringify(agent.capabilities)},
  task_type: "${agent.task_type}",
  prompt: \`${agent.prompt}\`,
  run: async (payload) => {
    return ${agent.output_schema}
  }
}
  `;
  const blob = new Blob([content], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${agent.agent_name}_Agent.ts`;
  link.click();
};

export default function AgentBlueprintGallery() {
  const [agents, setAgents] = useState<AgentBlueprint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("agent_blueprints")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setAgents(data as AgentBlueprint[]);
      setLoading(false);
    };

    fetchAgents();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🧠 Agent Blueprints</h1>
      {loading && (
        <div className="mb-6 text-muted-foreground">Loading agent blueprints...</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="p-4 border rounded-xl bg-background shadow-sm"
          >
            <h2 className="text-xl font-semibold">{agent.agent_name}</h2>
            <p className="text-sm text-muted-foreground italic mb-2">
              Task Type: {agent.task_type}
            </p>
            <p className="mb-2">{agent.mission}</p>

            <div className="text-sm mb-2">
              <strong>🧬 Personas:</strong> {agent.personas.join(", ")}
            </div>
            <div className="text-sm mb-2">
              <strong>⚙️ Capabilities:</strong>
              <ul className="list-disc pl-4 mt-1">
                {agent.capabilities.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            <div className="text-xs text-muted-foreground">
              Created: {new Date(agent.created_at).toLocaleDateString()}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => downloadAgentFile(agent)}
                className="px-3 py-1 text-sm bg-muted rounded"
              >
                📄 Export .ts
              </button>
              <a
                href={`/galaxy/agents/create?from=${agent.id}`}
                className="px-3 py-1 text-sm bg-primary text-white rounded"
              >
                🔁 Remix
              </a>
              <a
                href={`/galaxy/agents/${agent.id}`}
                className="px-3 py-1 text-sm bg-accent text-accent-foreground rounded"
              >
                Details
              </a>
            </div>
          </div>
        ))}
      </div>
      {(!loading && agents.length === 0) && (
        <div className="mt-8 text-muted-foreground text-center">
          No agent blueprints found.
        </div>
      )}
    </div>
  );
}
