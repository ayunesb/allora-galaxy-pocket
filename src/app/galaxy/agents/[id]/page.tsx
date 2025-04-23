
"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<AgentBlueprint | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("agent_blueprints")
        .select("*")
        .eq("id", id)
        .single();
      setAgent(data);
    };
    fetch();
  }, [id]);

  if (!agent) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{agent.agent_name}</h1>
      <p className="text-muted-foreground mb-4">{agent.mission}</p>

      <h2 className="font-semibold text-lg mb-1">🎓 Personas</h2>
      <ul className="mb-3">
        {agent.personas.map((p, i) => <li key={i}>- {p}</li>)}
      </ul>

      <h2 className="font-semibold text-lg mb-1">⚙️ Capabilities</h2>
      <ul className="mb-3">
        {agent.capabilities.map((c, i) => <li key={i}>- {c}</li>)}
      </ul>

      <div className="text-sm mb-4">
        <strong>🧠 Task Type:</strong> {agent.task_type}
      </div>

      <div className="text-sm mb-4">
        <strong>📦 Output Schema:</strong>
        <pre className="bg-muted p-2 rounded mt-1">{agent.output_schema}</pre>
      </div>

      <div className="text-sm mb-4">
        <strong>💬 Prompt:</strong>
        <pre className="bg-muted p-2 rounded mt-1">{agent.prompt}</pre>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => downloadAgentFile(agent)}
          className="bg-muted px-3 py-1 rounded text-sm"
        >
          📄 Export .ts
        </button>
        <a
          href={`/galaxy/agents/create?from=${agent.id}`}
          className="bg-primary text-white px-3 py-1 rounded text-sm"
        >
          🔁 Remix
        </a>
      </div>
    </div>
  );
}
