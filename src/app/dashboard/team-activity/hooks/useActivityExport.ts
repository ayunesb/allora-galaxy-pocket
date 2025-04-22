
import { useState } from "react";
import { toast } from "sonner";
import { exportActivityLogToPDF } from "@/lib/export/exportActivityLogToPDF";

export function useActivityExport(tenantId: string | undefined) {
  const [exporting, setExporting] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  
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
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  const exportPDF = async (filters: any) => {
    if (!tenantId) return;
    
    setExportingPDF(true);
    
    try {
      await exportActivityLogToPDF({
        tenantId,
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

  return {
    exportCSV,
    exportPDF,
    exporting,
    exportingPDF
  };
}
