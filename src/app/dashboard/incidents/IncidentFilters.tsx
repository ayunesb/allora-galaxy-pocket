
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

type IncidentFiltersProps = {
  agents: string[];
  alertTypes: string[];
  filters: { agent?: string; alertType?: string };
  setFilters: React.Dispatch<React.SetStateAction<{ agent?: string; alertType?: string }>>;
};

export default function IncidentFilters({ agents, alertTypes, filters, setFilters }: IncidentFiltersProps) {
  return (
    <Card className="p-4 mb-6 bg-background">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/2">
          <label className="text-sm font-medium mb-2 block">Filter by Agent</label>
          <Select
            value={filters.agent || ""}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, agent: value || undefined }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Agents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Agents</SelectItem>
              {agents.map((agent) => (
                <SelectItem key={agent} value={agent}>
                  {agent}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-1/2">
          <label className="text-sm font-medium mb-2 block">Filter by Alert Type</label>
          <Select
            value={filters.alertType || ""}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, alertType: value || undefined }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Alert Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Alert Types</SelectItem>
              {alertTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
