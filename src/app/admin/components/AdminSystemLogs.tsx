
import React from 'react';
import { useAdminLogs } from '@/hooks/useAdminLogs';
import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminSystemLogs() {
  const [filters, setFilters] = useState({
    dateRange: 7,
    eventType: 'all',
    userId: 'all',
    search: ''
  });
  
  const { logs, isLoading, refreshLogs } = useAdminLogs(filters);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleRefresh = () => {
    refreshLogs();
  };

  const handleDateRangeChange = (value: string) => {
    setFilters(prev => ({ ...prev, dateRange: parseInt(value) }));
  };

  const handleEventTypeChange = (value: string) => {
    setFilters(prev => ({ ...prev, eventType: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search logs..."
            value={filters.search}
            onChange={handleSearch}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Select 
            value={filters.dateRange.toString()} 
            onValueChange={handleDateRangeChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 hours</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={filters.eventType} 
            onValueChange={handleEventTypeChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All events</SelectItem>
              <SelectItem value="auth">Authentication</SelectItem>
              <SelectItem value="data">Data changes</SelectItem>
              <SelectItem value="api">API calls</SelectItem>
              <SelectItem value="error">Errors</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleRefresh} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead className="hidden md:table-cell">User</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.event_type === 'error' ? 'destructive' : 'outline'}>
                        {log.event_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {log.user_id ? log.user_id.substring(0, 8) : 'System'}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {log.message}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
