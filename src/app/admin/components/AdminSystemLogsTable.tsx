
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
import { Loader2, AlertCircle } from 'lucide-react';
import { SystemLog } from '@/types/systemLog';
import { LogPagination } from '@/app/dashboard/team-activity/components/LogPagination';

interface AdminSystemLogsTableProps {
  logs: SystemLog[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function AdminSystemLogsTable({ 
  logs, 
  isLoading, 
  currentPage,
  totalPages,
  onPageChange
}: AdminSystemLogsTableProps) {
  // Determine log severity for styling
  const getSeverityVariant = (log: SystemLog) => {
    if (log.event_type.includes('ERROR') || log.event_type.includes('SECURITY')) {
      return 'destructive';
    } else if (log.event_type.includes('WARNING')) {
      return 'warning';
    } else {
      return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-muted/10">
        <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">No logs found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant={getSeverityVariant(log)}>
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
            ))}
          </TableBody>
        </Table>
      </div>

      <LogPagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={onPageChange} 
      />
    </div>
  );
}
