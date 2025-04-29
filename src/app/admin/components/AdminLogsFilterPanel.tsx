
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { LogFilters } from '@/types/logFilters';
import { LogSeverity } from '@/types/systemLog';

interface AdminLogsFilterPanelProps {
  filters: LogFilters;
  onFilterChange: (filters: Partial<LogFilters>) => void;
  onClearFilters: () => void;
  eventTypes: string[];
}

export function AdminLogsFilterPanel({
  filters,
  onFilterChange,
  onClearFilters,
  eventTypes
}: AdminLogsFilterPanelProps) {
  const [searchInput, setSearchInput] = useState(filters.searchTerm || '');

  const handleSearch = () => {
    onFilterChange({ searchTerm: searchInput });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDateRangeChange = (value: string) => {
    onFilterChange({ dateRange: parseInt(value) });
  };

  const handleEventTypeChange = (value: string) => {
    onFilterChange({ eventType: value === 'all' ? null : value });
  };

  const handleSeverityChange = (value: string) => {
    onFilterChange({ severity: value === 'all' ? null : value as LogSeverity });
  };

  return (
    <Card className="p-4">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search logs..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyUp={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>

        <Select
          value={filters.dateRange.toString()}
          onValueChange={handleDateRangeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Last 24 hours</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.eventType || 'all'}
          onValueChange={handleEventTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {eventTypes.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.severity || 'all'}
          onValueChange={handleSeverityChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end mt-2">
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Reset Filters
        </Button>
      </div>
    </Card>
  );
}
