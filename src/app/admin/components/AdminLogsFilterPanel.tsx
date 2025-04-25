
import React from 'react';
import { LogFilters } from '@/types/logFilters';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AdminLogsFilterPanelProps {
  filters: LogFilters;
  onFilterChange: (newFilters: Partial<LogFilters>) => void;
}

export function AdminLogsFilterPanel({ filters, onFilterChange }: AdminLogsFilterPanelProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              placeholder="Search logs..."
              value={filters.searchTerm}
              onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
              className="w-full"
            />
          </div>
          <div>
            <Select 
              value={filters.eventType} 
              onValueChange={(value) => onFilterChange({ eventType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All events</SelectItem>
                <SelectItem value="AUTH_LOGIN">Auth Login</SelectItem>
                <SelectItem value="DATA_UPDATE">Data Update</SelectItem>
                <SelectItem value="SECURITY_ACCESS_DENIED">Security Access Denied</SelectItem>
                <SelectItem value="SYSTEM_UPDATE">System Update</SelectItem>
                <SelectItem value="API_ERROR">API Error</SelectItem>
                <SelectItem value="USER_JOURNEY">User Journey</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select
              value={filters.severity}
              onValueChange={(value) => onFilterChange({ severity: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Select
              value={filters.dateRange?.toString()}
              onValueChange={(value) => onFilterChange({ dateRange: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {filters.service !== undefined && (
            <div>
              <Select
                value={filters.service}
                onValueChange={(value) => onFilterChange({ service: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All services</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="auth">Authentication</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="storage">Storage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
