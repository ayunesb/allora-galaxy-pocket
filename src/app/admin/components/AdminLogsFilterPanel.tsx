
import React from "react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { LogFilters } from "@/types/logFilters";

export interface AdminLogsFilterPanelProps {
  filters: LogFilters;
  onFilterChange: (newFilters: Partial<LogFilters>) => void;
  onClearFilters?: () => void;
  eventTypes?: string[];
}

export function AdminLogsFilterPanel({
  filters,
  onFilterChange,
  onClearFilters,
  eventTypes = ['all', 'ERROR', 'WARNING', 'INFO', 'AUTH', 'SECURITY', 'USER_JOURNEY']
}: AdminLogsFilterPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search logs..."
              className="pl-8"
              value={filters.searchTerm}
              onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
            />
            {filters.searchTerm && (
              <button
                type="button"
                onClick={() => onFilterChange({ searchTerm: '' })}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="w-full md:w-48">
          <Select
            value={filters.eventType || 'all'}
            onValueChange={(value) => onFilterChange({ eventType: value === 'all' ? null : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === 'all' ? 'All Events' : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-48">
          <Select
            value={filters.severity || 'all'}
            onValueChange={(value) => onFilterChange({ severity: value === 'all' ? null : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="success">Success</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-48">
          <Select
            value={String(filters.dateRange)}
            onValueChange={(value) => onFilterChange({ dateRange: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 Hours</SelectItem>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {onClearFilters && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearFilters}
            className="whitespace-nowrap"
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
