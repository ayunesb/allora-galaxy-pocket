
import React from 'react';
import { SystemLog } from '@/types/systemLog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function SystemLogsTable() {
  // Placeholder for logs - in a real implementation, this would come from a data fetching hook
  const logs: SystemLog[] = [];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Timestamp</TableHead>
          <TableHead>Event Type</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Severity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              No logs available
            </TableCell>
          </TableRow>
        ) : (
          logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{log.created_at}</TableCell>
              <TableCell>{log.event_type}</TableCell>
              <TableCell>{log.message}</TableCell>
              <TableCell>{log.severity || 'N/A'}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
