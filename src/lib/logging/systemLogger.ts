
import { supabase } from '@/integrations/supabase/client';
import { LogSeverity } from '@/types/systemLog';

interface LogPayload {
  tenant_id: string;
  user_id?: string;
  event_type: string;
  message: string;
  severity: LogSeverity;
  meta?: Record<string, any>;
  created_at?: string;
}

export const logSystemEvent = async (payload: LogPayload) => {
  try {
    // Ensure created_at is present
    const logData = {
      ...payload,
      created_at: payload.created_at || new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('system_logs')
      .insert(logData)
      .select()
      .single();
      
    if (error) {
      console.error('Error logging system event:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Failed to log system event:', err);
    return null;
  }
};

export const logSecurityEvent = async (
  tenant_id: string,
  message: string,
  eventType: string,
  meta: Record<string, any> = {},
  user_id?: string
) => {
  return logSystemEvent({
    tenant_id,
    user_id,
    event_type: `SECURITY_${eventType}`,
    message,
    severity: 'warning',
    meta
  });
};

export const logError = async (
  tenant_id: string,
  message: string,
  error: Error | any,
  meta: Record<string, any> = {},
  user_id?: string
) => {
  return logSystemEvent({
    tenant_id,
    user_id,
    event_type: 'ERROR',
    message,
    severity: 'error',
    meta: {
      ...meta,
      errorMessage: error.message,
      stack: error.stack,
      code: error.code
    }
  });
};
