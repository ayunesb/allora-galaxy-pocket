
import { useState } from 'react';
import { useExportCSV } from './useExportCSV';
import { useToast } from './use-toast';

export function useExportService() {
  const [isExporting, setIsExporting] = useState(false);
  const { exportTable } = useExportCSV();
  const { toast } = useToast();

  // Function to trigger the export and handle the download
  const exportData = async (tableName: string, filters?: Record<string, any>): Promise<string> => {
    setIsExporting(true);
    try {
      const csvContent = await exportTable(tableName, filters);
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${tableName}_export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: `${tableName} data has been exported to CSV.`,
      });
      
      return csvContent;
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return { exportTable: exportData, isExporting };
}
