
'use client'

import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface VersionEntry {
  id: string;
  agent_name: string;
  prompt: string;
  version: number;
  created_at: string;
  edited_by?: string;
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
      if (error) return;
      if (data && data.length > 0) {
        const uniqueAgents = [...new Set(data.map((d: any) => d.agent_name as string))];
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
      if (error) return;
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

  const deleteVersion = async (id: string) => {
    await supabase.from("agent_prompt_versions").delete().eq("id", id);
    setVersions(versions.filter((v) => v.id !== id));
    alert("Deleted.");
  };

  const duplicateVersion = async (v: VersionEntry) => {
    const nextVersion = (versions[0]?.version || 0) + 1;
    await supabase.from("agent_prompt_versions").insert({
      agent_name: v.agent_name,
      prompt: v.prompt,
      version: nextVersion,
      edited_by: v.edited_by,
      tenant_id: (v as any).tenant_id, // Safe fallback
    });
    // Refetch list after duplication
    const { data } = await supabase
      .from("agent_prompt_versions")
      .select("*")
      .eq("agent_name", selectedAgent)
      .order("version", { ascending: false });
    setVersions((data as VersionEntry[]) || []);
    alert("Duplicated.");
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
            <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
              <div className="flex gap-2 items-center">
                <h2 className="text-lg font-semibold">v{v.version}</h2>
                <button
                  type="button"
                  onClick={() => restorePrompt(v.id, v.prompt)}
                  className="text-xs px-2 py-1 rounded bg-primary text-white"
                >
                  <span role="img" aria-label="Restore">🔁</span> Restore
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => deleteVersion(v.id)}
                  className="text-xs px-2 py-1 bg-red-500 text-white rounded"
                  title="Delete version"
                >
                  🗑 Delete
                </button>
                <button
                  type="button"
                  onClick={() => duplicateVersion(v)}
                  className="text-xs px-2 py-1 bg-secondary text-white rounded"
                  title="Duplicate version"
                >
                  📄 Duplicate
                </button>
                <a
                  href={`/agents/versions/compare/${encodeURIComponent(selectedAgent)}?left=${v.id}`}
                  className="text-xs px-2 py-1 bg-muted text-foreground rounded border"
                  title="Compare"
                >
                  🔎 Compare
                </a>
              </div>
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
