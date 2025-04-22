
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ActivityTableProps {
  logs: any[];
}

export function ActivityTable({ logs }: ActivityTableProps) {
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
        </TableBody>
      </Table>
    </div>
  );
}
