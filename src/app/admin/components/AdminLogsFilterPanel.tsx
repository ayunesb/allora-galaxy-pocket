
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogFilters } from "@/types/logFilters";

export interface AdminLogsFilterPanelProps {
  filters: LogFilters;
  onFilterChange: (newFilters: Partial<LogFilters>) => void;
}

export function AdminLogsFilterPanel({ filters, onFilterChange }: AdminLogsFilterPanelProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ searchTerm: e.target.value });
  };

  const handleDateRangeChange = (value: string) => {
    onFilterChange({ dateRange: parseInt(value, 10) });
  };

  const handleEventTypeChange = (value: string) => {
    onFilterChange({ eventType: value });
  };

  const handleSeverityChange = (value: string) => {
    onFilterChange({ severity: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4">
      <div>
        <Input
          placeholder="Search logs..."
          value={filters.searchTerm || ""}
          onChange={handleSearchChange}
          className="w-full"
        />
      </div>
      <div>
        <Select value={filters.eventType || "all"} onValueChange={handleEventTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="AUTH">Auth Events</SelectItem>
            <SelectItem value="SECURITY">Security Events</SelectItem>
            <SelectItem value="ERROR">Errors</SelectItem>
            <SelectItem value="USER_JOURNEY">User Journey</SelectItem>
            <SelectItem value="STRATEGY">Strategy Events</SelectItem>
            <SelectItem value="CAMPAIGN">Campaign Events</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Select value={filters.severity || "all"} onValueChange={handleSeverityChange}>
          <SelectTrigger>
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Select
          value={filters.dateRange ? filters.dateRange.toString() : "7"}
          onValueChange={handleDateRangeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Last 24 Hours</SelectItem>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
            <SelectItem value="365">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
