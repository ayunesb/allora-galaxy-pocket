
import { Loader2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityTable } from "./ActivityTable";
import { LogPagination } from "./LogPagination";

interface ActivityLogsProps {
  logs: any[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ActivityLogs({ logs, loading, currentPage, totalPages, onPageChange }: ActivityLogsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-4 w-4" />
          Activity Logs
        </CardTitle>
        <Badge variant="outline">
          {logs.length} entries
        </Badge>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : logs.length > 0 ? (
          <>
            <ActivityTable logs={logs} />
            <LogPagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={onPageChange} 
            />
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No activity logs found matching your filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
