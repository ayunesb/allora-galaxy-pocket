
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { SystemLog } from "@/types/systemLog";
import { format } from 'date-fns';
import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdminSystemLogsTableProps {
  logs: SystemLog[];
  isLoading: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    logsPerPage: number;
  };
  onNextPage: () => void;
  onPrevPage: () => void;
  onGoToPage: (page: number) => void;
}

export function AdminSystemLogsTable({
  logs,
  isLoading,
  pagination,
  onNextPage,
  onPrevPage,
  onGoToPage,
}: AdminSystemLogsTableProps) {
  const getSeverityBadge = (severity: string | undefined) => {
    if (!severity) return null;
    
    switch(severity.toLowerCase()) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'medium':
      case 'warning':
        return <Badge variant="warning">Warning</Badge>;
      case 'low':
      case 'info':
        return <Badge variant="secondary">Info</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getSeverityIcon = (severity: string | undefined) => {
    if (!severity) return <Info className="h-4 w-4 text-muted-foreground" />;
    
    switch(severity.toLowerCase()) {
      case 'critical':
      case 'high':
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'medium':
      case 'warning':
        return <ShieldAlert className="h-4 w-4 text-warning" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEventTypeChip = (eventType: string) => {
    if (eventType.includes('SECURITY')) {
      return <Badge variant="outline" className="border-red-400 text-red-500">Security</Badge>;
    } else if (eventType.includes('ERROR')) {
      return <Badge variant="outline" className="border-amber-400 text-amber-500">Error</Badge>;
    } else if (eventType.includes('AUTH')) {
      return <Badge variant="outline" className="border-blue-400 text-blue-500">Auth</Badge>;
    } else if (eventType.includes('USER')) {
      return <Badge variant="outline" className="border-green-400 text-green-500">User</Badge>;
    } else {
      return <Badge variant="outline" className="border-gray-400 text-gray-500">System</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No logs found matching your filters</p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead className="w-[120px]">Event Type</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="w-[100px]">Tenant</TableHead>
              <TableHead className="w-[80px]">Severity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-xs">
                  {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                </TableCell>
                <TableCell>
                  {getEventTypeChip(log.event_type)}
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="truncate block max-w-md">
                          {log.message}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-md whitespace-normal">{log.message}</p>
                        {log.meta && (
                          <div className="mt-2 text-xs">
                            <p className="font-semibold">Metadata:</p>
                            <pre className="mt-1 bg-slate-100 p-2 rounded-sm">
                              {JSON.stringify(log.meta, null, 2)}
                            </pre>
                          </div>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="font-mono text-xs truncate">
                  {log.tenant_id ? log.tenant_id.substring(0, 8) : 'System'}
                </TableCell>
                <TableCell>
                  {getSeverityBadge(log.meta?.severity)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex justify-center">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={onGoToPage}
          onPreviousPage={onPrevPage}
          onNextPage={onNextPage}
        />
      </div>
    </div>
  );
}
