
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { useTenant } from "./useTenant";
import { useAuth } from "./useAuth";
import { exportToPDF, ExportFilters, ExportOptions } from "@/lib/export/exportPDF";
import { supabase } from "@/integrations/supabase/client";

export function useExportService() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Download data as CSV
   */
  const downloadCSV = async (type: 'strategies' | 'campaigns' | 'kpis' | 'system_logs', filters: any = {}) => {
    if (!tenant?.id) return;
    
    setIsLoading(true);
    try {
      // Determine table name based on type
      const tableName = 
        type === 'strategies' ? 'vault_strategies' :
        type === 'campaigns' ? 'campaigns' :
        type === 'kpis' ? 'kpi_metrics' : 'system_logs';
      
      // Calculate start date for filtering if dateRange is provided
      let query = supabase.from(tableName).select('*').eq('tenant_id', tenant.id);
      
      if (filters.dateRange) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - filters.dateRange);
        query = query.gte('created_at', startDate.toISOString());
      }
      
      // Apply additional filters
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      
      if (filters.search) {
        // Apply search filter based on table
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
        toast({ 
          title: "No data to export",
          description: "There are no records matching your criteria"
        });
        return;
      }

      // Convert data to CSV
      const headers = Object.keys(data[0]);
      const csvRows = data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle complex values like objects
          const cell = typeof value === 'object' ? 
            JSON.stringify(value).replace(/"/g, '""') : 
            String(value || '').replace(/"/g, '""');
          return `"${cell}"`;
        }).join(',')
      );
      
      const csvContent = [headers.join(','), ...csvRows].join('\n');

      // Trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Log the export
      await logExport(type, 'csv', data.length);
      
      toast({
        title: "Export successful",
        description: `${data.length} records exported as CSV`
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Generate and download a PDF report
   */
  const downloadPDF = async (type: 'strategy' | 'campaign' | 'kpi' | 'system', filters: any = {}) => {
    if (!tenant?.id) return;
    
    setIsLoading(true);
    try {
      const exportFilters: ExportFilters = {
        tenantId: tenant.id,
        type,
        dateRange: filters.dateRange || 7,
        userId: filters.userId,
        search: filters.search,
        groupBy: filters.groupBy
      };
      
      const exportOptions: ExportOptions = {
        includeMetadata: true,
        includeCharts: true,
        attachCoverPage: true
      };
      
      const { url, fileName } = await exportToPDF(exportFilters, exportOptions);
      
      // Trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "PDF export successful",
        description: `Report has been generated and downloaded`
      });
    } catch (error) {
      console.error('PDF export failed:', error);
      toast({
        title: "PDF export failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Email a PDF report to recipients
   */
  const emailReport = async (type: 'strategy' | 'campaign' | 'kpi' | 'system', recipients: string[], filters: any = {}) => {
    if (!tenant?.id || !recipients.length) return;
    
    setIsLoading(true);
    try {
      const exportFilters: ExportFilters = {
        tenantId: tenant.id,
        type,
        dateRange: filters.dateRange || 7,
        userId: filters.userId,
        search: filters.search,
        groupBy: filters.groupBy
      };
      
      const exportOptions: ExportOptions = {
        includeMetadata: true,
        includeCharts: true,
        attachCoverPage: true,
        emailTo: recipients
      };
      
      await exportToPDF(exportFilters, exportOptions);
      
      toast({
        title: "Report sent",
        description: `The ${type} report has been sent to ${recipients.join(', ')}`
      });
      
      // Log the emailed report
      await logExport(type, 'email', 0, recipients);
    } catch (error) {
      console.error('Email report failed:', error);
      toast({
        title: "Failed to send report",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Log export activity
   */
  const logExport = async (type: string, method: 'csv' | 'pdf' | 'email', recordCount: number, recipients?: string[]) => {
    if (!tenant?.id || !user?.id) return;
    
    try {
      // Log to system_logs
      await supabase
        .from('system_logs')
        .insert({
          tenant_id: tenant.id,
          user_id: user.id,
          event_type: `export_${method}`,
          message: `Exported ${type} data as ${method}${recipients ? ' and sent via email' : ''}`,
          meta: {
            export_type: type,
            export_method: method,
            record_count: recordCount,
            recipients
          }
        });
    } catch (error) {
      console.error('Failed to log export activity:', error);
    }
  };

  return { 
    downloadCSV, 
    downloadPDF, 
    emailReport,
    isLoading
  };
}
