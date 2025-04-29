
import { supabase } from '@/integrations/supabase/client';
import { ToastService } from '@/services/ToastService';

interface EmailOptions {
  to: string[];
  subject: string;
  body: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export async function sendReportEmail(options: EmailOptions, tenantId: string) {
  try {
    // In a real implementation, this would use an email service
    // For now, we'll mock it and just log to the database
    console.log('Sending email to:', options.to);
    console.log('Subject:', options.subject);
    console.log('Has attachment:', !!options.attachmentUrl);
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Log the email send attempt
    const { error } = await supabase
      .from('system_logs')
      .insert({
        tenant_id: tenantId,
        event_type: 'EMAIL_SENT',
        message: `Email sent: ${options.subject}`,
        meta: {
          recipients: options.to,
          attachment_name: options.attachmentName || null,
          has_attachment: !!options.attachmentUrl
        }
      });
      
    if (error) throw error;
    
    ToastService.success("Email sent successfully");
    
    return { success: true };
  } catch (error: any) {
    console.error('Failed to send email:', error);
    ToastService.error(`Failed to send email: ${error.message}`);
    return { success: false, error };
  }
}

export async function sendBulkEmails(emails: EmailOptions[], tenantId: string) {
  try {
    const results = [];
    
    for (const email of emails) {
      const result = await sendReportEmail(email, tenantId);
      results.push(result);
      
      if (!result.success) {
        console.warn('Failed to send email:', email.to);
      }
      
      // Small delay between sends to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    if (failureCount > 0) {
      ToastService.warning(`${successCount} emails sent, ${failureCount} failed`);
    } else {
      ToastService.success(`${successCount} emails sent successfully`);
    }
    
    return {
      success: failureCount === 0,
      totalSent: successCount,
      totalFailed: failureCount
    };
  } catch (error: any) {
    console.error('Failed to send bulk emails:', error);
    ToastService.error(`Failed to send emails: ${error.message}`);
    return { success: false, error };
  }
}
