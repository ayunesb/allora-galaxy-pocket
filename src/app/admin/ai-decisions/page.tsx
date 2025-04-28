import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AgentFeedbackTable } from "./components/AgentFeedbackTable";
import { ApprovalMetricsCard } from "./components/ApprovalMetricsCard";
import { DecisionFilters } from "./components/DecisionFilters";
import { AuditAnalytics } from "./components/AuditAnalytics";
import { DecisionList } from "./components/DecisionList";
import { ApprovalStatsTable } from "./components/ApprovalStatsTable";
import { toast } from "@/components/ui/sonner";
import type { Decision } from "@/types/decisions";

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
      try {
        // Use direct query instead of an RPC function that doesn't exist
        const { data, error } = await supabase
          .from('strategies')
          .select('id, strategy_id:id, decision:status, approved:auto_approved, auto_approved, confidence_score:impact_score, decision_made_at:created_at, created_at, tenant_id, strategy_title:title, agent_name:generated_by');
        
        if (error) throw error;
        
        // Transform and explicitly type cast to ensure compatibility
        const transformedDecisions = (data || []).map(item => ({
          id: item.id,
          strategy_id: item.strategy_id,
          decision: item.decision,
          approved: item.approved,
          auto_approved: item.auto_approved,
          confidence_score: item.confidence_score || 0,
          decision_made_at: item.decision_made_at,
          created_at: item.created_at,
          tenant_id: item.tenant_id,
          strategy_title: item.strategy_title,
          agent_name: item.agent_name,
          // These are optional in our updated type
          agent: item.agent_name,
          version: 1, // Default version
          prompt: '', // Default empty prompt
          changed_by: '' // Default empty changed_by
        }));
        
        setDecisions(transformedDecisions);
      } catch (err) {
        console.error("Error fetching AI strategy decisions:", err);
        toast.error("Failed to load AI strategy decisions");
      }
    };
    fetchDecisions();
  }, []);

  useEffect(() => {
    async function fetchVotes() {
      const agentNames = [...new Set(decisions.map(d => d.agent_name).filter(Boolean))] as string[];
      const versions = [...new Set(decisions.map(d => d.id))];

      if (!agentNames.length || !versions.length) {
        setVoteSummaries({});
        return;
      }

      try {
        const { data: votesRaw, error } = await supabase
          .from("agent_prompt_votes")
          .select("version, vote")
          .in("agent_name", agentNames);

        if (error) throw error;

        const summaries: Record<number, VoteSummary> = {};

        if (votesRaw) {
          for (let version of versions) {
            const versionNumber = parseInt(version);
            if (isNaN(versionNumber)) continue;

            const votes = votesRaw.filter(v => v.version === versionNumber);
            const upvotes = votes.filter(v => v.vote === 1).length;
            const downvotes = votes.filter(v => v.vote === -1).length;
            const total_votes = votes.length;
            summaries[versionNumber] = { 
              version: versionNumber, 
              total_votes, 
              upvotes, 
              downvotes 
            };
          }
        }
        setVoteSummaries(summaries);
      } catch (err) {
        console.error("Error fetching votes:", err);
      }
    }
    if (decisions.length) fetchVotes();
  }, [decisions]);

  useEffect(() => {
    let versionRows: Record<string, AuditDataRow> = {};
    for (const d of decisions) {
      const versionKey = d.id;
      const vote = voteSummaries[d.id] || { upvotes: 0, downvotes: 0, total_votes: 0 };
      
      versionRows[versionKey] = {
        version: parseInt(d.id),
        success_rate: 90 - (d.decision === "rollback" ? 30 : 0),
        rollback_count: d.decision === "rollback" ? 1 : 0,
        upvotes: vote.upvotes,
      };
    }
    
    // Sort by version id
    let chartData = Object.values(versionRows).sort((a, b) => a.version - b.version);
    setAuditData(chartData);
  }, [decisions, voteSummaries]);

  const uniqueAgents = useMemo(
    () => Array.from(new Set(decisions.map(d => d.agent_name).filter(Boolean) as string[])),
    [decisions]
  );

  const uniqueStatus = useMemo(
    () => Array.from(new Set(decisions.map(d => d.decision).filter(Boolean))),
    [decisions]
  );

  const filteredDecisions = useMemo(() => {
    return decisions.filter(d =>
      (!agentFilter || d.agent_name === agentFilter) &&
      (!statusFilter || d.decision === statusFilter)
    );
  }, [decisions, agentFilter, statusFilter]);

  const exportDecisionLog = async (strategyId: string | null) => {
    if (!strategyId) return;
    try {
      // Use direct query instead of RPC function
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('id', strategyId);
      
      if (error) throw error;

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `strategy-${strategyId}-audit-log.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting decision log:", err);
      toast.error("Failed to export decision log");
    }
  };

  function getAgentChainForStrategy(strategyId: string | null) {
    const byStrategy = decisions
      .filter(d => d.strategy_id === strategyId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const chain: string[] = [];
    let prev = "";
    for (const d of byStrategy) {
      if (d.agent_name && d.agent_name !== prev) {
        chain.push(d.agent_name.replace(/_Agent$/, ""));
        prev = d.agent_name;
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
