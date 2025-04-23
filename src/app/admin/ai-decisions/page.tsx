
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PromptDiff from "./PromptDiff";

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

export default function AIDecisionAudit() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [voteSummaries, setVoteSummaries] = useState<Record<number, VoteSummary>>({});

  useEffect(() => {
    // Fetch AI prompt decisions
    const fetch = async () => {
      const { data } = await supabase
        .from("ai_strategy_decisions")
        .select("*")
        .order("version", { ascending: false });
      setDecisions(data || []);
    };
    fetch();
  }, []);

  useEffect(() => {
    // Fetch votes summary for all unique agent/version pairs in decisions
    async function fetchVotes() {
      const agentNames = [...new Set(decisions.map(d => d.agent))];
      let summaries: Record<number, VoteSummary> = {};
      for (const agent of agentNames) {
        if (!agent) continue;
        const { data: votes } = await supabase
          .from("agent_prompt_votes")
          .select("version, sum(vote)::int as total_votes, count(*) filter (where vote=1) as upvotes, count(*) filter (where vote=-1) as downvotes")
          .eq("agent_name", agent)
          .group("version");
        if (votes) {
          for (const v of votes) {
            summaries[Number(v.version)] = {
              version: Number(v.version),
              total_votes: Number(v.total_votes),
              upvotes: Number(v.upvotes),
              downvotes: Number(v.downvotes)
            };
          }
        }
      }
      setVoteSummaries(summaries);
    }
    if (decisions.length) fetchVotes();
  }, [decisions]);

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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📜 AI Decision Log</h1>
      <div className="space-y-8">
        {/* Group logs by strategy */}
        {Array.from(new Set(decisions.map(d => d.strategy_id))).map((strategyId) => (
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
            <div className="space-y-4">
              {decisions
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
