import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { ActivityFilters } from "./components/ActivityFilters";
import { ActivityLogs } from "./components/ActivityLogs";
import { useActivityExport } from "./hooks/useActivityExport";

export default function TeamActivityDashboard() {
  const { tenant } = useTenant();
  const { isAdmin } = useRolePermissions();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    user: "all",
    actionType: "all",
    dateRange: "7",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;
  
  const { exportCSV, exportPDF, exporting, exportingPDF } = useActivityExport();
  
  useEffect(() => {
    if (tenant?.id && !isAdmin) {
      navigate("/dashboard");
    }
  }, [tenant, isAdmin, navigate]);

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
  
  const eventTypes = Array.from(new Set(logs.map(log => log.event_type)));
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(logs.length / logsPerPage);

  if (!isAdmin) {
    return null;
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
            onClick={() => exportCSV(logs)}
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
            onClick={() => exportPDF(filters)}
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

      <ActivityFilters
        users={users}
        eventTypes={eventTypes}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <ActivityLogs
        logs={currentLogs}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
