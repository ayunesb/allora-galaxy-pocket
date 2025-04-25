
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
import { SystemLog } from '@/types/systemLog';
import { format } from 'date-fns';

interface SecurityLogViewerProps {
  logs: SystemLog[];
  onLogSelect?: (log: SystemLog) => void;
}

export function SecurityLogViewer({ 
  logs, 
  onLogSelect 
}: SecurityLogViewerProps) {
  const getSeverityVariant = (log: SystemLog) => {
    if (log.event_type.includes('ERROR') || log.event_type.includes('SECURITY')) {
      return 'destructive';
    } else if (log.event_type.includes('WARNING')) {
      return 'warning';
    } else {
      return 'outline';
    }
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Event Type</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow 
              key={log.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onLogSelect && onLogSelect(log)}
            >
              <TableCell>
                {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
              </TableCell>
              <TableCell>
                <Badge variant={getSeverityVariant(log)}>
                  {log.event_type}
                </Badge>
              </TableCell>
              <TableCell>
                {log.user_id ? log.user_id.substring(0, 8) : 'System'}
              </TableCell>
              <TableCell className="max-w-md truncate">
                {log.message}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
