
import { useState } from "react";
import { toast } from "sonner";
import { exportToPDF, ExportFilters, ExportOptions } from "@/lib/export/exportPDF";
import { useTenant } from "@/hooks/useTenant";
import { supabase } from "@/integrations/supabase/client";

export function useActivityExport() {
  const { tenant } = useTenant();
  const [exporting, setExporting] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  
  /**
   * Export logs as CSV
   */
  const exportCSV = async (logs: any[]) => {
    if (!logs.length) return;
    
    setExporting(true);
    
    try {
      const headers = ["Event Type", "Message", "User ID", "Timestamp", "Details"];
      const csvContent = [
        headers.join(","),
        ...logs.map(log => [
          log.event_type,
          `"${log.message.replace(/"/g, '""')}"`,
          log.user_id,
          new Date(log.created_at).toISOString(),
          `"${JSON.stringify(log.meta).replace(/"/g, '""')}"`
        ].join(","))
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `team-activity-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Log the export event
      if (tenant?.id) {
        await supabase
          .from('system_logs')
          .insert({
            tenant_id: tenant.id,
            event_type: 'export_csv',
            message: 'Exported team activity as CSV',
            meta: {
              record_count: logs.length,
              export_format: 'csv'
            }
          });
      }
      
      toast.success("CSV exported successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  /**
   * Export activity logs as PDF using the enhanced exportToPDF function
   */
  const exportPDF = async (filters: any) => {
    if (!tenant?.id) return;
    
    setExportingPDF(true);
    
    try {
      const exportFilters: ExportFilters = {
        tenantId: tenant.id,
        dateRange: parseInt(filters.dateRange),
        type: 'system',
        userId: filters.user !== "all" ? filters.user : undefined,
        search: filters.search || undefined
      };
      
      const exportOptions: ExportOptions = {
        includeMetadata: true,
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
      
      toast.success("PDF report generated successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to generate PDF report");
    } finally {
      setExportingPDF(false);
    }
  };

  /**
   * Send PDF report via email
   */
  const emailPDF = async (filters: any, recipientEmail: string) => {
    if (!tenant?.id || !recipientEmail) return;
    
    setExportingPDF(true);
    
    try {
      const exportFilters: ExportFilters = {
        tenantId: tenant.id,
        dateRange: parseInt(filters.dateRange),
        type: 'system',
        userId: filters.user !== "all" ? filters.user : undefined,
        search: filters.search || undefined
      };
      
      const exportOptions: ExportOptions = {
        includeMetadata: true,
        attachCoverPage: true,
        emailTo: [recipientEmail]
      };
      
      await exportToPDF(exportFilters, exportOptions);
      
      toast.success("PDF report sent via email");
    } catch (error) {
      console.error("Error emailing PDF:", error);
      toast.error("Failed to send PDF report via email");
    } finally {
      setExportingPDF(false);
    }
  };

  return {
    exportCSV,
    exportPDF,
    emailPDF,
    exporting,
    exportingPDF
  };
}
