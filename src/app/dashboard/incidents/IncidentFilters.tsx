
import React from "react";

type IncidentFiltersProps = {
  agents: string[];
  alertTypes: string[];
  filters: { agent?: string; alertType?: string };
  setFilters: React.Dispatch<React.SetStateAction<{ agent?: string; alertType?: string }>>;
};

export default function IncidentFilters({ agents, alertTypes, filters, setFilters }: IncidentFiltersProps) {
  return (
    <div className="flex space-x-2 mb-4">
      <select
        className="border p-2 rounded"
        value={filters.agent || ""}
        onChange={(e) => setFilters((prev) => ({ ...prev, agent: e.target.value || undefined }))}
      >
        <option value="">All Agents</option>
        {agents.map((agent) => (
          <option key={agent} value={agent}>
            {agent}
          </option>
        ))}
      </select>

      <select
        className="border p-2 rounded"
        value={filters.alertType || ""}
        onChange={(e) => setFilters((prev) => ({ ...prev, alertType: e.target.value || undefined }))}
      >
        <option value="">All Alert Types</option>
        {alertTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </div>
  );
}
