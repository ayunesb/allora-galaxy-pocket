
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

export interface FilterState {
  dateRange: string;
  agentFilter: string;
  approvalType: string;
}

export interface DecisionFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
}

export function DecisionFilters({ filters, onFilterChange }: DecisionFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-muted/30 p-4 rounded-md">
      <div className="w-full sm:w-1/3">
        <label className="text-sm font-medium mb-1 block">Date Range</label>
        <Select 
          value={filters.dateRange}
          onValueChange={(value) => onFilterChange({ dateRange: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last quarter</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full sm:w-1/3">
        <label className="text-sm font-medium mb-1 block">Agent</label>
        <Select 
          value={filters.agentFilter} 
          onValueChange={(value) => onFilterChange({ agentFilter: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All agents</SelectItem>
            <SelectItem value="CEO">CEO Agent</SelectItem>
            <SelectItem value="Marketing">Marketing Agent</SelectItem>
            <SelectItem value="Sales">Sales Agent</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full sm:w-1/3">
        <label className="text-sm font-medium mb-1 block">Approval Status</label>
        <Select 
          value={filters.approvalType}
          onValueChange={(value) => onFilterChange({ approvalType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by approval" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All approvals</SelectItem>
            <SelectItem value="ai">AI approved</SelectItem>
            <SelectItem value="human">Human approved</SelectItem>
            <SelectItem value="pending">Pending approval</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
