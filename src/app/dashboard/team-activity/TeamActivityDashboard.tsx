
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Download, Filter, Users, Loader2, FileText } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { exportActivityLogToPDF } from "@/lib/export/exportActivityLogToPDF";
import { toast } from "sonner";

export default function TeamActivityDashboard() {
  const { tenant } = useTenant();
  const { isAdmin } = useRolePermissions();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [filters, setFilters] = useState({
    user: "all",
    actionType: "all",
    dateRange: "7",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  // Redirect non-admin users
  useEffect(() => {
    if (tenant?.id && !isAdmin) {
      navigate("/dashboard");
    }
  }, [tenant, isAdmin, navigate]);

  // Fetch system logs
  useEffect(() => {
    async function fetchLogs() {
      if (!tenant?.id) return;
      setLoading(true);
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(filters.dateRange));
      
      let query = supabase
        .from("system_logs")
        .select(`
          id,
          user_id,
          event_type,
          message,
          meta,
          created_at
        `)
        .eq("tenant_id", tenant.id)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false });
      
      // Apply filters
      if (filters.user !== "all") {
        query = query.eq("user_id", filters.user);
      }
      
      if (filters.actionType !== "all") {
        query = query.eq("event_type", filters.actionType);
      }
      
      if (filters.search) {
        query = query.ilike("message", `%${filters.search}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching logs:", error);
      } else {
        setLogs(data || []);
      }
      
      setLoading(false);
    }
    
    fetchLogs();
  }, [tenant?.id, filters]);
  
  // Fetch users for filter dropdown
  useEffect(() => {
    async function fetchUsers() {
      if (!tenant?.id) return;
      
      const { data, error } = await supabase
        .from("tenant_user_roles")
        .select(`
          user_id,
          profiles:user_id(id, avatar_url)
        `)
        .eq("tenant_id", tenant.id);
      
      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setUsers(data || []);
      }
    }
    
    fetchUsers();
  }, [tenant?.id]);
  
  // Get unique event types for filter dropdown
  const eventTypes = Array.from(new Set(logs.map(log => log.event_type)));
  
  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(logs.length / logsPerPage);
  
  // Export logs as CSV
  const exportCSV = async () => {
    if (!logs.length) return;
    
    setExporting(true);
    
    try {
      // Create CSV content
      const headers = ["Event Type", "Message", "User ID", "Timestamp", "Details"];
      const csvContent = [
        headers.join(","),
        ...logs.map(log => [
          log.event_type,
          `"${log.message.replace(/"/g, '""')}"`, // Escape quotes
          log.user_id,
          format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
          `"${JSON.stringify(log.meta).replace(/"/g, '""')}"` // Escape quotes
        ].join(","))
      ].join("\n");
      
      // Download the CSV file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `team-activity-${format(new Date(), "yyyy-MM-dd")}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  // Export logs as PDF
  const exportPDF = async () => {
    if (!logs.length || !tenant?.id) return;
    
    setExportingPDF(true);
    
    try {
      await exportActivityLogToPDF({
        tenantId: tenant.id,
        dateRange: parseInt(filters.dateRange),
        actionType: filters.actionType !== "all" ? filters.actionType : undefined,
        userId: filters.user !== "all" ? filters.user : undefined,
        search: filters.search || undefined
      });
      toast.success("PDF report generated successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to generate PDF report");
    } finally {
      setExportingPDF(false);
    }
  };
  
  // Get badge color based on event type
  const getEventBadgeColor = (eventType: string) => {
    const types: Record<string, string> = {
      strategy_activity: "bg-blue-500",
      campaign_activity: "bg-green-500",
      feedback: "bg-amber-500",
      user_action: "bg-purple-500",
      notification: "bg-gray-500"
    };
    
    // Extract category from event_type (e.g., "strategy_viewed" -> "strategy")
    const category = eventType.split("_")[0];
    return types[category + "_activity"] || "bg-gray-500";
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
    setCurrentPage(1); // Reset to first page on new search
  };

  if (!isAdmin) {
    return null; // Prevent rendering for non-admins
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Team Activity Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor team actions across your workspace
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={exportCSV}
            disabled={exporting || logs.length === 0}
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export CSV
          </Button>

          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={exportPDF}
            disabled={exportingPDF || logs.length === 0}
          >
            {exportingPDF ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Download PDF
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="user-filter" className="block text-sm font-medium mb-1">
                User
              </label>
              <Select 
                value={filters.user} 
                onValueChange={(value) => setFilters({ ...filters, user: value })}
              >
                <SelectTrigger id="user-filter">
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.user_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="action-filter" className="block text-sm font-medium mb-1">
                Action Type
              </label>
              <Select 
                value={filters.actionType} 
                onValueChange={(value) => setFilters({ ...filters, actionType: value })}
              >
                <SelectTrigger id="action-filter">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {eventTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="date-filter" className="block text-sm font-medium mb-1">
                Time Period
              </label>
              <Select 
                value={filters.dateRange} 
                onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
              >
                <SelectTrigger id="date-filter">
                  <SelectValue placeholder="Last 7 days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Last 24 hours</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="search" className="block text-sm font-medium mb-1">
                Search
              </label>
              <Input
                id="search"
                placeholder="Search messages..."
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

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
                    {currentLogs.map((log) => (
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
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        // Show first page, last page, current page and pages around current
                        const pagesToShow = [1, totalPages];
                        if (currentPage > 1) pagesToShow.push(currentPage);
                        if (currentPage > 2) pagesToShow.push(currentPage - 1);
                        if (currentPage < totalPages - 1) pagesToShow.push(currentPage + 1);
                        
                        const uniquePages = Array.from(new Set(pagesToShow)).sort((a, b) => a - b);
                        
                        // Add ellipsis where needed
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
                                  setCurrentPage(pageNum);
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
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
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
    </div>
  );
}
