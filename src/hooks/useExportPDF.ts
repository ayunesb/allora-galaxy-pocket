
import { useTenant } from "./useTenant";
import { useAuth } from "./useAuth";
import { toast } from "@/components/ui/use-toast";
import { exportToPDF, ExportFilters, ExportOptions } from "@/lib/export/exportPDF";
import { useExportLogger } from "./useExportLogger";

export function useExportPDF() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const { logExport } = useExportLogger();

  const downloadPDF = async (type: 'strategy' | 'campaign' | 'kpi' | 'system', filters: any = {}) => {
    if (!tenant?.id) return;
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
    }
  };

  const emailReport = async (type: 'strategy' | 'campaign' | 'kpi' | 'system', recipients: string[], filters: any = {}) => {
    if (!tenant?.id || !recipients.length) return;
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

      await logExport(type, 'email', 0, recipients);
    } catch (error) {
      console.error('Email report failed:', error);
      toast({
        title: "Failed to send report",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  return { downloadPDF, emailReport };
}
