
'use client'

import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface VersionEntry {
  id: string;
  agent_name: string;
  prompt: string;
  version: number;
  created_at: string;
}

export default function PromptVersionHistory() {
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [agentList, setAgentList] = useState<string[]>([]);

  useEffect(() => {
    const fetchAgents = async () => {
      const { data, error } = await supabase
        .from("agent_blueprints")
        .select("agent_name");
      if (error) {
        // Optionally handle error
        return;
      }
      if (data && data.length > 0) {
        const uniqueAgents = [...new Set(data.map(d => d.agent_name as string))];
        setAgentList(uniqueAgents);
        setSelectedAgent(uniqueAgents[0]);
      }
    };
    fetchAgents();
  }, []);

  useEffect(() => {
    const fetchVersions = async () => {
      if (!selectedAgent) return;
      const { data, error } = await supabase
        .from("agent_prompt_versions")
        .select("*")
        .eq("agent_name", selectedAgent)
        .order("version", { ascending: false });
      if (error) {
        // Optionally handle error
        return;
      }
      if (data) setVersions(data as VersionEntry[]);
    };
    fetchVersions();
  }, [selectedAgent]);

  const restorePrompt = async (versionId: string, prompt: string) => {
    await supabase
      .from("agent_blueprints")
      .update({ prompt })
      .eq("agent_name", selectedAgent);
    alert("✅ Prompt restored to production.");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🧠 Prompt Versions</h1>
      <select
        onChange={e => setSelectedAgent(e.target.value)}
        className="mb-4 p-2 border rounded"
        value={selectedAgent}
      >
        {agentList.map(agent => (
          <option key={agent} value={agent}>
            {agent}
          </option>
        ))}
      </select>

      {versions.length === 0 && (
        <p className="text-sm text-muted-foreground">No versions found.</p>
      )}

      <div className="space-y-4">
        {versions.map(v => (
          <div
            key={v.id}
            className="border p-4 rounded-xl bg-background shadow"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">v{v.version}</h2>
              <button
                onClick={() => restorePrompt(v.id, v.prompt)}
                className="text-sm px-3 py-1 rounded bg-primary text-white"
              >
                <span role="img" aria-label="Restore">🔁</span> Restore to Production
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {new Date(v.created_at).toLocaleString()}
            </p>
            <pre className="text-xs whitespace-pre-wrap bg-muted p-2 rounded">
              {v.prompt}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
