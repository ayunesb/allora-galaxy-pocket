
import React from "react";

export default function AgentChain({ agents }: { agents: string[] }) {
  return (
    <div className="flex gap-2 items-center text-sm">
      {agents.map((agent, i) => (
        <span key={agent} className="flex items-center">
          <span className="px-2 py-1 bg-muted rounded">{agent}</span>
          {i < agents.length - 1 && <span className="mx-1">➡️</span>}
        </span>
      ))}
    </div>
  );
}
