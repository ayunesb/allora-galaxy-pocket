
import { useTenant } from "./useTenant";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useExportLogger } from "./useExportLogger";

export function useExportCSV() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const { logExport } = useExportLogger();

  const downloadCSV = async (type: 'strategies' | 'campaigns' | 'kpis' | 'system_logs', filters: any = {}) => {
    if (!tenant?.id) return;
    try {
      let tableName =
        type === 'strategies' ? 'vault_strategies' :
        type === 'campaigns' ? 'campaigns' :
        type === 'kpis' ? 'kpi_metrics' : 'system_logs';
      
      let query = supabase.from(tableName).select('*').eq('tenant_id', tenant.id);
      if (filters.dateRange) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - filters.dateRange);
        query = query.gte('created_at', startDate.toISOString());
      }
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.search) {
        switch (type) {
          case 'strategies':
            query = query.ilike('title', `%${filters.search}%`);
            break;
          case 'campaigns':
            query = query.ilike('name', `%${filters.search}%`);
            break;
          case 'system_logs':
            query = query.ilike('message', `%${filters.search}%`);
            break;
        }
      }
      const { data, error } = await query;
      if (error) throw error;
      if (!data?.length) {
        toast.warning("No data to export", {
          description: "There are no records matching your criteria"
        });
        return;
      }

      const headers = Object.keys(data[0]);
      const csvRows = data.map(row => 
        headers.map(header => {
          const value = row[header];
          const cell = typeof value === 'object' ? 
            JSON.stringify(value).replace(/"/g, '""') : 
            String(value || '').replace(/"/g, '""');
          return `"${cell}"`;
        }).join(',')
      );
      const csvContent = [headers.join(','), ...csvRows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      await logExport(type, 'csv', data.length);

      toast.success("Export successful", {
        description: `${data.length} records exported as CSV`
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error("Export failed", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  };

  return { downloadCSV };
}
