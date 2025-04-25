
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
import { Button } from "@/components/ui/button";
import { SystemLog } from "@/types/systemLog";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminSystemLogsTableProps {
  logs: SystemLog[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  onGoToPage: (page: number) => void;
}

export function AdminSystemLogsTable({
  logs,
  isLoading,
  currentPage,
  totalPages,
  onNextPage,
  onPrevPage,
  onGoToPage,
}: AdminSystemLogsTableProps) {
  const formatDate = (date: string | Date) => {
    // Convert Date object to string if necessary
    const dateToFormat = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "short",
      timeStyle: "medium",
    }).format(dateToFormat);
  };

  const getBadgeVariant = (severity?: string) => {
    switch (severity) {
      case "error":
        return "destructive";
      case "warning":
        return "warning";
      case "info":
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No logs found matching your filters.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Event Type</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Service</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-xs">
                  {formatDate(log.timestamp || log.created_at)}
                </TableCell>
                <TableCell className="font-medium">{log.event_type}</TableCell>
                <TableCell>{log.message}</TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(log.severity)}>
                    {log.severity || "info"}
                  </Badge>
                </TableCell>
                <TableCell>{log.service}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
