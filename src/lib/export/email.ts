
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ExportFilters } from './types';
import { getReportTypeName } from './utils';

export async function emailReport(
  fileUrl: string | undefined, 
  fileName: string, 
  recipients: string[], 
  filters: ExportFilters
): Promise<void> {
  try {
    if (!fileUrl) {
      throw new Error('No file URL available for email attachment');
    }
    
    const { error } = await supabase.functions.invoke('send-export-email', {
      body: {
        to: recipients,
        subject: `Allora OS ${getReportTypeName(filters.type)} Report`,
        html: `
          <h1>Allora OS Report</h1>
          <p>Attached is your requested ${getReportTypeName(filters.type)} report.</p>
          <p>Report generated on: ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}</p>
          <p>Date range: Last ${filters.dateRange || 7} days</p>
          <p><a href="${fileUrl}" target="_blank">Click here to download the report</a></p>
        `,
        attachmentUrl: fileUrl,
        attachmentName: fileName
      }
    });
    
    if (error) {
      throw error;
    }
    
    await supabase
      .from('system_logs')
      .insert({
        tenant_id: filters.tenantId,
        event_type: 'email_report',
        message: `Emailed ${getReportTypeName(filters.type)} report to ${recipients.join(', ')}`,
        meta: {
          report_type: filters.type || 'system',
          file_name: fileName,
          recipients
        }
      });
      
  } catch (error) {
    console.error('Error sending email report:', error);
    throw error;
  }
}

