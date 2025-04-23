
import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import PromptDiff from "./PromptDiff";
import AgentChain from "@/components/AgentChain";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";

type Decision = {
  id: string;
  tenant_id: string | null;
  strategy_id: string | null;
  agent: string | null;
  version: number;
  prompt: string;
  previous_prompt?: string;
  changed_by: string | null;
  ai_reason?: string | null;
  source_event?: string | null;
  created_at: string;
};

type VoteSummary = {
  version: number;
  total_votes: number;
  upvotes: number;
  downvotes: number;
};

type AuditDataRow = {
  version: number;
  success_rate: number;
  rollback_count: number;
  upvotes: number;
};

export default function AIDecisionAudit() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [voteSummaries, setVoteSummaries] = useState<Record<number, VoteSummary>>({});
  const [agentFilter, setAgentFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [auditData, setAuditData] = useState<AuditDataRow[]>([]);

  useEffect(() => {
    // Fetch AI prompt decisions
    const fetchDecisions = async () => {
      const { data } = await supabase
        .from("ai_strategy_decisions")
        .select("*")
        .order("version", { ascending: false });
      setDecisions(data || []);
    };
    fetchDecisions();
  }, []);

  useEffect(() => {
    // Fetch all votes and aggregate in JS
    async function fetchVotes() {
      const agentNames = [...new Set(decisions.map(d => d.agent).filter(Boolean))] as string[];
      const versions = [...new Set(decisions.map(d => d.version))];

      if (!agentNames.length || !versions.length) {
        setVoteSummaries({});
        return;
      }

      const { data: votesRaw } = await supabase
        .from("agent_prompt_votes")
        .select("version, vote")
        .in("agent_name", agentNames)
        .in("version", versions);

      const summaries: Record<number, VoteSummary> = {};

      if (votesRaw) {
        for (let version of versions) {
          const votes = votesRaw.filter(v => v.version === version);
          const upvotes = votes.filter(v => v.vote === 1).length;
          const downvotes = votes.filter(v => v.vote === -1).length;
          const total_votes = votes.length;
          summaries[version] = { version, total_votes, upvotes, downvotes };
        }
      }
      setVoteSummaries(summaries);
    }
    if (decisions.length) fetchVotes();
  }, [decisions]);

  // ----- FILTERING LOGIC -----
  const uniqueAgents = useMemo(
    () => Array.from(new Set(decisions.map(d => d.agent).filter(Boolean) as string[])),
    [decisions]
  );

  const filteredDecisions = useMemo(() => {
    return decisions.filter(d =>
      (!agentFilter || d.agent === agentFilter) &&
      (!statusFilter || d.source_event === statusFilter)
    );
  }, [decisions, agentFilter, statusFilter]);

  // ----- AUDIT CHART DATA -----
  useEffect(() => {
    // Mock: In real use, this should join with agent_tasks, rollbacks etc.
    // Here, we simulate audit info using available decisions & votes.
    let versionRows: Record<number, AuditDataRow> = {};
    for (const d of decisions) {
      const vote = voteSummaries[d.version] || { upvotes: 0, downvotes: 0, total_votes: 0 };
      versionRows[d.version] = {
        version: d.version,
        success_rate: 90 - (d.source_event === "rollback" ? 30 : 0), // MOCK data
        rollback_count: d.source_event === "rollback" ? 1 : 0,
        upvotes: vote.upvotes,
      };
    }
    let chartData = Object.values(versionRows).sort((a, b) => a.version - b.version);
    setAuditData(chartData);
  }, [decisions, voteSummaries]);

  // Export audit log for a strategy as JSON
  const exportDecisionLog = async (strategyId: string | null) => {
    if (!strategyId) return;
    const { data } = await supabase
      .from("ai_strategy_decisions")
      .select("*")
      .eq("strategy_id", strategyId);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `strategy-${strategyId}-audit-log.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Derive ordered agent chain per strategy
  function getAgentChainForStrategy(strategyId: string | null) {
    const byStrategy = decisions
      .filter(d => d.strategy_id === strategyId)
      .sort((a, b) => a.version - b.version);
    // Chain of agent names, dedupe sequential
    const chain: string[] = [];
    let prev = "";
    for (const d of byStrategy) {
      if (d.agent && d.agent !== prev) {
        chain.push(d.agent.replace(/_Agent$/, "")); // Remove _Agent for display
        prev = d.agent;
      }
    }
    return chain;
  }

  // Unique strategy-IDs in filtered data
  const shownStrategies = Array.from(new Set(filteredDecisions.map(d => d.strategy_id)));

  // Unique status/source events (for status filtering)
  const uniqueStatus = Array.from(new Set(decisions.map(d => d.source_event).filter(Boolean)));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📜 AI Decision Log</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          onChange={e => setAgentFilter(e.target.value)}
          value={agentFilter}
          className="p-2 border rounded"
        >
          <option value="">All Agents</option>
          {uniqueAgents.map(agent => (
            <option key={agent} value={agent}>
              {agent.replace(/_Agent$/, "")}
            </option>
          ))}
        </select>
        <select
          onChange={e => setStatusFilter(e.target.value)}
          value={statusFilter}
          className="p-2 border rounded"
        >
          <option value="">All Types</option>
          {uniqueStatus.map(st => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {/* Audit summary chart */}
      <div className="mb-10 bg-muted rounded-lg p-3">
        <h3 className="font-bold mb-1">Audit Analytics (by Version)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={auditData}>
            <XAxis dataKey="version" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="success_rate" stroke="#10b981" name="Success %" />
            <Line type="monotone" dataKey="upvotes" stroke="#3b82f6" name="Upvotes" />
            <Line type="monotone" dataKey="rollback_count" stroke="#ef4444" name="Rollbacks" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-8">
        {/* Group logs by filtered strategy */}
        {shownStrategies.map((strategyId) => (
          <section key={strategyId} className="mb-10">
            <div className="flex items-center gap-4 mb-3">
              <h2 className="text-xl font-semibold">
                Strategy ID: <span className="font-mono">{strategyId}</span>
              </h2>
              <button
                onClick={() => exportDecisionLog(strategyId)}
                className="text-sm px-3 py-1 bg-secondary text-white rounded"
              >
                📤 Export Audit Log
              </button>
            </div>
            <AgentChain agents={getAgentChainForStrategy(strategyId)} />
            <div className="space-y-4 mt-3">
              {filteredDecisions
                .filter((d) => d.strategy_id === strategyId)
                .sort((a, b) => b.version - a.version)
                .map((d, i, arr) => {
                  // Find previous prompt for diff; fallback to previous_prompt column if present
                  const prevPrompt =
                    (arr[i + 1]?.prompt && arr[i + 1].version === d.version - 1) ? arr[i + 1].prompt : d.previous_prompt || "";

                  const voteSummary = voteSummaries[d.version];

                  // Agent consensus label (optional)
                  let consensus = "";
                  if (voteSummary) {
                    if (voteSummary.upvotes > voteSummary.downvotes) consensus = "📊 Agent consensus: Favorable";
                    else if (voteSummary.downvotes > voteSummary.upvotes) consensus = "⚠️ Contested";
                    else consensus = "";
                  }

                  return (
                    <div key={d.id} className="border rounded-xl p-4 shadow-sm bg-background">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-semibold">
                          v{d.version} — {d.agent || ""}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {d.created_at && new Date(d.created_at).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-muted mb-2">
                        Event: {d.source_event || "—"}
                      </p>
                      {/* Show human-readable diff */}
                      <PromptDiff oldPrompt={prevPrompt} newPrompt={d.prompt} />
                      {/* Agent votes per version */}
                      {voteSummary && (
                        <p className="text-xs mt-1 text-muted-foreground">
                          🗳 {voteSummary.upvotes} 👍 / {voteSummary.downvotes} 👎 — Total: {voteSummary.total_votes}
                        </p>
                      )}
                      {consensus && (
                        <span
                          className={
                            consensus.includes("Favorable")
                              ? "text-green-700"
                              : consensus.includes("Contested")
                              ? "text-orange-600"
                              : ""
                          }
                        >
                          {consensus}
                        </span>
                      )}
                      <pre className="text-xs bg-muted p-2 rounded whitespace-pre-wrap mt-2">{d.prompt}</pre>
                      {d.ai_reason && (
                        <p className="text-sm mt-2 italic">
                          🧠 {d.ai_reason}
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
