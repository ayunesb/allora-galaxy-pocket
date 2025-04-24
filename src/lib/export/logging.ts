
import { supabase } from '@/integrations/supabase/client';
import { ExportFilters } from './types';

export async function logExportEvent(filters: ExportFilters, fileName: string): Promise<void> {
  try {
    await supabase
      .from('system_logs')
      .insert({
        tenant_id: filters.tenantId,
        event_type: 'export_pdf',
        message: `Generated ${getReportTypeName(filters.type)} report`,
        meta: {
          report_type: filters.type || 'system',
          file_name: fileName,
          filters_applied: {
            dateRange: filters.dateRange,
            userId: filters.userId,
            search: filters.search,
            groupBy: filters.groupBy
          }
        }
      });
  } catch (error) {
    console.error('Error logging export event:', error);
  }
}

export async function saveExportLog(filters: ExportFilters, fileName: string, fileUrl?: string): Promise<void> {
  try {
    await supabase
      .from('export_logs')
      .insert({
        tenant_id: filters.tenantId,
        user_id: filters.userId || null,
        export_type: filters.type || 'system',
        delivery_method: 'download',
        status: 'completed',
        meta: {
          file_name: fileName,
          file_url: fileUrl,
          filters: {
            dateRange: filters.dateRange,
            search: filters.search,
            groupBy: filters.groupBy
          }
        },
        completed_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error saving export log:', error);
  }
}

