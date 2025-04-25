
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SystemLog } from '@/types/systemLog';
import { format } from 'date-fns';

interface LogViewerProps {
  logs: SystemLog[];
  isLoading?: boolean;
  onLogSelect?: (log: SystemLog) => void;
  emptyMessage?: string;
}

export function LogViewer({ 
  logs, 
  isLoading = false,
  onLogSelect,
  emptyMessage = "No logs to display"
}: LogViewerProps) {
  // Function to determine badge variant based on log severity or type
  const getLogSeverityVariant = (log: SystemLog) => {
    if (log.severity) {
      const severity = log.severity.toLowerCase();
      return severity === 'error' ? 'destructive' : 
             severity === 'warning' ? 'warning' : 
             severity === 'success' ? 'default' : 
             'secondary';
    }
    
    // Fallback to checking event_type
    const eventType = log.event_type?.toLowerCase();
    if (eventType?.includes('error')) return 'destructive';
    if (eventType?.includes('warning')) return 'warning';
    if (eventType?.includes('success')) return 'success';
    return 'secondary';
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Timestamp</TableHead>
            <TableHead>Event Type</TableHead>
            <TableHead className="hidden md:table-cell">Message</TableHead>
            <TableHead className="w-[100px]">Severity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow 
              key={log.id} 
              className={onLogSelect ? "cursor-pointer hover:bg-muted/50" : ""}
              onClick={onLogSelect ? () => onLogSelect(log) : undefined}
            >
              <TableCell className="font-mono text-xs">
                {format(new Date(log.created_at || log.timestamp || ''), 'yyyy-MM-dd HH:mm:ss')}
              </TableCell>
              <TableCell className="font-medium">
                {log.event_type}
              </TableCell>
              <TableCell className="hidden md:table-cell max-w-md truncate">
                {log.message}
              </TableCell>
              <TableCell>
                <Badge variant={getLogSeverityVariant(log)}>
                  {log.severity || 'info'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
