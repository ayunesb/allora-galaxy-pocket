
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Users } from "lucide-react";

interface ActivityLogsProps {
  logs: any[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ActivityLogs({ logs, loading, currentPage, totalPages, onPageChange }: ActivityLogsProps) {
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
            
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) onPageChange(currentPage - 1);
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pagesToShow = [1, totalPages];
                      if (currentPage > 1) pagesToShow.push(currentPage);
                      if (currentPage > 2) pagesToShow.push(currentPage - 1);
                      if (currentPage < totalPages - 1) pagesToShow.push(currentPage + 1);
                      
                      const uniquePages = Array.from(new Set(pagesToShow)).sort((a, b) => a - b);
                      
                      const paginationItems = [];
                      let prevPage = 0;
                      
                      uniquePages.forEach(pageNum => {
                        if (pageNum - prevPage > 1) {
                          paginationItems.push(
                            <PaginationItem key={`ellipsis-${pageNum}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        
                        paginationItems.push(
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                onPageChange(pageNum);
                              }}
                              isActive={currentPage === pageNum}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                        
                        prevPage = pageNum;
                      });
                      
                      return paginationItems;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) onPageChange(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
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
