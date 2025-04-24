
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";

interface ActivityTableProps {
  logs: any[];
}

export function ActivityTable({ logs }: ActivityTableProps) {
  const isMobile = useIsMobile();
  
  const getEventBadgeColor = (eventType: string) => {
    const types: Record<string, string> = {
      strategy_activity: "bg-blue-500",
      campaign_activity: "bg-green-500",
      feedback: "bg-amber-500",
      user_action: "bg-purple-500",
      notification: "bg-gray-500"
    };
    
    const category = eventType.split("_")[0];
    return types[category + "_activity"] || "bg-gray-500";
  };

  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="border rounded-lg p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <Badge className={getEventBadgeColor(log.event_type)}>
                {log.event_type}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {format(new Date(log.created_at), "MMM d, yyyy h:mm a")}
              </span>
            </div>
            
            <div className="text-sm">{log.message}</div>
            
            <div className="text-xs text-muted-foreground">
              User: {log.user_id}
            </div>
            
            {log.meta && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs font-medium mb-1">Details:</p>
                <pre className="text-xs overflow-hidden max-w-full text-ellipsis bg-muted p-2 rounded">
                  {JSON.stringify(log.meta, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
        
        {logs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No activity logs found
          </div>
        )}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event Type</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <Badge className={getEventBadgeColor(log.event_type)}>
                  {log.event_type}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate">{log.message}</TableCell>
              <TableCell className="whitespace-nowrap">{log.user_id}</TableCell>
              <TableCell className="whitespace-nowrap">
                {format(new Date(log.created_at), "MMM d, yyyy h:mm a")}
              </TableCell>
              <TableCell>
                {log.meta && (
                  <pre className="text-xs overflow-hidden max-w-xs text-ellipsis">
                    {JSON.stringify(log.meta, null, 2)}
                  </pre>
                )}
              </TableCell>
            </TableRow>
          ))}
          
          {logs.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                No activity logs found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
