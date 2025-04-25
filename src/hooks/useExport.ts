
import { useState } from 'react';
import { SystemLog } from '@/types/systemLog';
import { exportLogs } from '@/utils/exportUtils';
import { ToastService } from '@/services/ToastService';

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportLogsToCSV = async (logs: SystemLog[]) => {
    setIsExporting(true);
    try {
      await exportLogs(logs, 'csv');
      ToastService.success({
        title: 'Export successful',
        description: 'Logs have been exported to CSV'
      });
      return true;
    } catch (error) {
      console.error('CSV export error:', error);
      ToastService.error({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'An error occurred during export'
      });
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  const exportLogsToPDF = async (logs: SystemLog[]) => {
    setIsExporting(true);
    try {
      await exportLogs(logs, 'pdf');
      ToastService.success({
        title: 'Export successful',
        description: 'Logs have been exported to PDF'
      });
      return true;
    } catch (error) {
      console.error('PDF export error:', error);
      ToastService.error({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'An error occurred during export'
      });
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportLogsToCSV,
    exportLogsToPDF
  };
}
