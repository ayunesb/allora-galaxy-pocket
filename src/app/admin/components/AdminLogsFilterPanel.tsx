
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { LogFilters } from "@/types/logFilters";
import { LogSeverity } from "@/types/systemLog";

interface AdminLogsFilterPanelProps {
  filters: LogFilters;
  onFilterChange: (filters: Partial<LogFilters>) => void;
  onClearFilters?: () => void;
  eventTypes: string[];
}

export function AdminLogsFilterPanel({
  filters,
  onFilterChange,
  onClearFilters,
  eventTypes
}: AdminLogsFilterPanelProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search" className="text-sm font-medium">
            Search
          </Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search logs..."
              className="pl-8"
              value={filters.searchTerm || filters.search || ''}
              onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
            />
          </div>
        </div>

        <div className="w-full sm:w-[180px]">
          <Label htmlFor="event-type" className="text-sm font-medium">
            Event Type
          </Label>
          <Select
            value={filters.eventType || ''}
            onValueChange={(value) => onFilterChange({ eventType: value === 'all' ? null : value })}
          >
            <SelectTrigger id="event-type">
              <SelectValue placeholder="All events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All events</SelectItem>
              {eventTypes.filter(type => type !== 'all').map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-[180px]">
          <Label htmlFor="severity" className="text-sm font-medium">
            Severity
          </Label>
          <Select
            value={filters.severity || ''}
            onValueChange={(value) => onFilterChange({ severity: value === '' ? null : value as LogSeverity })}
          >
            <SelectTrigger id="severity">
              <SelectValue placeholder="All severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All severities</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-[180px]">
          <Label htmlFor="date-range" className="text-sm font-medium">
            Date Range
          </Label>
          <Select
            value={filters.dateRange ? filters.dateRange.toString() : '7'}
            onValueChange={(value) => {
              if (value === "custom") {
                setShowDatePicker(true);
              } else {
                setShowDatePicker(false);
                onFilterChange({ dateRange: parseInt(value), dateFrom: undefined, dateTo: undefined });
              }
            }}
          >
            <SelectTrigger id="date-range">
              <SelectValue placeholder="Last 7 days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 hours</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showDatePicker && (
          <>
            <div className="w-full sm:w-auto">
              <Label htmlFor="date-from" className="text-sm font-medium">
                From
              </Label>
              <DatePicker
                value={filters.dateFrom ? new Date(filters.dateFrom) : null}
                onChange={(date) => onFilterChange({ dateFrom: date || undefined, dateRange: 0 })}
              />
            </div>
            <div className="w-full sm:w-auto">
              <Label htmlFor="date-to" className="text-sm font-medium">
                To
              </Label>
              <DatePicker
                value={filters.dateTo ? new Date(filters.dateTo) : null}
                onChange={(date) => onFilterChange({ dateTo: date || undefined, dateRange: 0 })}
              />
            </div>
          </>
        )}

        {onClearFilters && (
          <div className="flex items-end">
            <Button variant="ghost" onClick={onClearFilters} className="mb-0.5">
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
