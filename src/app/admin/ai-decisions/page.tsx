
import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AgentFeedbackTable } from "./components/AgentFeedbackTable";
import { ApprovalMetricsCard } from "./components/ApprovalMetricsCard";
import { DecisionFilters } from "./components/DecisionFilters";
import { AuditAnalytics } from "./components/AuditAnalytics";
import { DecisionList } from "./components/DecisionList";
import { ApprovalStatsTable } from "./components/ApprovalStatsTable";

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

  useEffect(() => {
    let versionRows: Record<number, AuditDataRow> = {};
    for (const d of decisions) {
      const vote = voteSummaries[d.version] || { upvotes: 0, downvotes: 0, total_votes: 0 };
      versionRows[d.version] = {
        version: d.version,
        success_rate: 90 - (d.source_event === "rollback" ? 30 : 0),
        rollback_count: d.source_event === "rollback" ? 1 : 0,
        upvotes: vote.upvotes,
      };
    }
    let chartData = Object.values(versionRows).sort((a, b) => a.version - b.version);
    setAuditData(chartData);
  }, [decisions, voteSummaries]);

  const uniqueAgents = useMemo(
    () => Array.from(new Set(decisions.map(d => d.agent).filter(Boolean) as string[])),
    [decisions]
  );

  const uniqueStatus = useMemo(
    () => Array.from(new Set(decisions.map(d => d.source_event).filter(Boolean))),
    [decisions]
  );

  const filteredDecisions = useMemo(() => {
    return decisions.filter(d =>
      (!agentFilter || d.agent === agentFilter) &&
      (!statusFilter || d.source_event === statusFilter)
    );
  }, [decisions, agentFilter, statusFilter]);

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

  function getAgentChainForStrategy(strategyId: string | null) {
    const byStrategy = decisions
      .filter(d => d.strategy_id === strategyId)
      .sort((a, b) => a.version - b.version);
    const chain: string[] = [];
    let prev = "";
    for (const d of byStrategy) {
      if (d.agent && d.agent !== prev) {
        chain.push(d.agent.replace(/_Agent$/, ""));
        prev = d.agent;
      }
    }
    return chain;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📜 AI Decision Log</h1>

      <div className="grid gap-6 mb-6">
        <ApprovalMetricsCard />
      </div>

      <div className="mb-8">
        <ApprovalStatsTable />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Agent Feedback History</h2>
        <AgentFeedbackTable />
      </div>

      <AuditAnalytics auditData={auditData} />

      <DecisionFilters
        agentFilter={agentFilter}
        statusFilter={statusFilter}
        uniqueAgents={uniqueAgents}
        uniqueStatus={uniqueStatus}
        onAgentFilterChange={setAgentFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <DecisionList
        decisions={filteredDecisions}
        voteSummaries={voteSummaries}
        exportDecisionLog={exportDecisionLog}
        getAgentChainForStrategy={getAgentChainForStrategy}
      />
    </div>
  );
}
