
import { exportToPDF } from './exportPDF';

interface ExportFilters {
  tenantId: string;
  dateRange?: number;
  actionType?: string;
  userId?: string;
  search?: string;
}

/**
 * Legacy function maintained for backward compatibility
 * Uses the new exportToPDF engine under the hood
 */
export async function exportActivityLogToPDF({
  tenantId,
  dateRange = 7,
  actionType,
  userId,
  search
}: ExportFilters): Promise<void> {
  try {
    // Map to new filter structure
    const filters = {
      tenantId,
      dateRange,
      type: 'system',
      userId,
      search
    };
    
    // Use new export engine
    const { url, fileName } = await exportToPDF(filters, {
      includeMetadata: true,
      attachCoverPage: true
    });
    
    // Trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return;
  } catch (error) {
    console.error('Failed to generate PDF report:', error);
    throw error;
  }
}
