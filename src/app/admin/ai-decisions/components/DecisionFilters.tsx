
import React from 'react';

type DecisionFiltersProps = {
  agentFilter: string;
  statusFilter: string;
  uniqueAgents: string[];
  uniqueStatus: string[];
  onAgentFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
};

export function DecisionFilters({
  agentFilter,
  statusFilter,
  uniqueAgents,
  uniqueStatus,
  onAgentFilterChange,
  onStatusFilterChange
}: DecisionFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <select
        onChange={e => onAgentFilterChange(e.target.value)}
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
        onChange={e => onStatusFilterChange(e.target.value)}
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
  );
}
