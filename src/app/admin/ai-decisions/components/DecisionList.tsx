
import React from 'react';
import PromptDiff from "../PromptDiff";
import AgentChain from "@/components/AgentChain";

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

type DecisionListProps = {
  decisions: Decision[];
  voteSummaries: Record<number, VoteSummary>;
  exportDecisionLog: (strategyId: string | null) => void;
  getAgentChainForStrategy: (strategyId: string | null) => string[];
};

export function DecisionList({
  decisions,
  voteSummaries,
  exportDecisionLog,
  getAgentChainForStrategy
}: DecisionListProps) {
  const shownStrategies = Array.from(new Set(decisions.map(d => d.strategy_id)));

  return (
    <div className="space-y-8">
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
            {decisions
              .filter((d) => d.strategy_id === strategyId)
              .sort((a, b) => b.version - a.version)
              .map((d, i, arr) => {
                const prevPrompt =
                  (arr[i + 1]?.prompt && arr[i + 1].version === d.version - 1) 
                    ? arr[i + 1].prompt 
                    : d.previous_prompt || "";

                const voteSummary = voteSummaries[d.version];

                let consensus = "";
                if (voteSummary) {
                  if (voteSummary.upvotes > voteSummary.downvotes) 
                    consensus = "📊 Agent consensus: Favorable";
                  else if (voteSummary.downvotes > voteSummary.upvotes) 
                    consensus = "⚠️ Contested";
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
                    <PromptDiff oldPrompt={prevPrompt} newPrompt={d.prompt} />
                    {voteSummary && (
                      <p className="text-xs mt-1 text-muted-foreground">
                        🗳 {voteSummary.upvotes} 👍 / {voteSummary.downvotes} 👎 — Total: {voteSummary.total_votes}
                      </p>
                    )}
                    {consensus && (
                      <span className={consensus.includes("Favorable") ? "text-green-700" : "text-orange-600"}>
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
  );
}
