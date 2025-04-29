
import { useState } from 'react';
import { useExportCSV } from './useExportCSV';
import { useToast } from './use-toast';

export function useExportService() {
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
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

  // Added downloadCSV method
  const downloadCSV = async (tableName: string, filters?: Record<string, any>): Promise<boolean> => {
    setIsLoading(true);
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
        title: "CSV Downloaded Successfully",
        description: `${tableName} data has been exported to CSV.`,
      });
      
      return true;
    } catch (error) {
      console.error('CSV download failed:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Added downloadPDF method
  const downloadPDF = async (tableName: string, filters?: Record<string, any>): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock PDF generation for now - in a real app, you'd use a PDF library
      toast({
        title: "PDF Generation",
        description: "PDF generation would be implemented with a PDF library.",
      });
      
      return true;
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast({
        title: "PDF Generation Failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Added emailReport method
  const emailReport = async (email: string, tableName: string, filters?: Record<string, any>): Promise<boolean> => {
    setIsLoading(true);
    try {
      // This would be implemented with an email service
      toast({
        title: "Report Emailed",
        description: `Report would be sent to ${email}`,
      });
      
      return true;
    } catch (error) {
      console.error('Email report failed:', error);
      toast({
        title: "Email Failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    exportTable: exportData, 
    isExporting,
    downloadCSV,
    downloadPDF,
    emailReport,
    isLoading
  };
}
