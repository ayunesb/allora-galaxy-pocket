
import { supabase } from '@/integrations/supabase/client';

interface ReportEmailOptions {
  to: string[];
  subject: string;
  html: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export async function sendReportEmail({
  to,
  subject,
  html,
  attachmentUrl,
  attachmentName
}: ReportEmailOptions): Promise<void> {
  try {
    const { data, error } = await supabase.functions.invoke('send-export-email', {
      body: {
        to,
        subject,
        html,
        attachmentUrl,
        attachmentName
      }
    });

    if (error) {
      console.error('Error sending report email:', error);
      throw error;
    }

    // Log the email event
    await supabase
      .from('system_logs')
      .insert({
        event_type: 'report_email',
        message: `Sent report email to ${to.join(', ')}`,
        meta: {
          recipients: to,
          attachment_name: attachmentName,
          has_attachment: !!attachmentUrl
        }
      });

    return data;
  } catch (error) {
    console.error('Failed to send report email:', error);
    throw error;
  }
}
