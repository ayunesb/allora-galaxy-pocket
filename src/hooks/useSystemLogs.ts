
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';
import { toast } from "sonner";
import { SystemLog, LogSeverity } from '@/types/systemLog';

interface LogActivityParams {
  event_type: string;
  message: string;
  meta?: Record<string, any>;
  severity?: LogSeverity;
}

export function useSystemLogs() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [isLogging, setIsLogging] = useState(false);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  /**
   * Log an activity to the system_logs table
   */
  const logActivity = async ({
    event_type,
    message,
    meta = {},
    severity = 'info'
  }: LogActivityParams): Promise<{ success: boolean; log?: SystemLog; error?: any }> => {
    if (!tenant?.id) {
      console.warn("Can't log activity: No tenant ID available");
      return { success: false, error: "No tenant ID" };
    }
    
    setIsLogging(true);
    
    try {
      // Prepare the log payload
      const logPayload = {
        tenant_id: tenant.id,
        event_type,
        message,
        meta: { ...meta, severity },
        user_id: user?.id
      };
      
      // Insert the log into the system_logs table
      const { data, error } = await supabase
        .from('system_logs')
        .insert(logPayload)
        .select()
        .single();
        
      if (error) throw error;
      
      return { success: true, log: data };
    } catch (err) {
      console.error("Failed to log activity:", err);
      return { success: false, error: err };
    } finally {
      setIsLogging(false);
    }
  };

  /**
   * Log an error to the system_logs table
   */
  const logError = async (
    message: string,
    error: Error | any,
    meta: Record<string, any> = {}
  ): Promise<{ success: boolean; log?: SystemLog; error?: any }> => {
    return logActivity({
      event_type: 'ERROR',
      message,
      meta: {
        ...meta,
        errorMessage: error.message,
        stack: error.stack,
        code: error.code
      },
      severity: 'error'
    });
  };

  /**
   * Log a security event to the system_logs table
   */
  const logSecurityEvent = async (
    message: string,
    eventType: string,
    meta: Record<string, any> = {}
  ): Promise<{ success: boolean; log?: SystemLog; error?: any }> => {
    return logActivity({
      event_type: `SECURITY_${eventType}`,
      message,
      meta,
      severity: 'warning'
    });
  };

  /**
   * Log a user journey transition
   */
  const logJourneyStep = async (
    from: string,
    to: string,
    details: Record<string, any> = {}
  ): Promise<{ success: boolean; log?: SystemLog; error?: any }> => {
    return logActivity({
      event_type: 'USER_JOURNEY',
      message: `User navigated from ${from} to ${to}`,
      meta: {
        from,
        to,
        ...details
      }
    });
  };

  /**
   * Get recent logs for the current tenant
   */
  const getRecentLogs = async (limit = 50): Promise<void> => {
    if (!tenant?.id) {
      console.warn("Can't fetch logs: No tenant ID available");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (fetchError) throw fetchError;
      
      setLogs(data || []);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      setError(err);
      toast("Error loading logs", {
        description: "Failed to retrieve system logs"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch logs on component mount
  useEffect(() => {
    if (tenant?.id) {
      getRecentLogs();
    }
  }, [tenant?.id]);
  
  return {
    logActivity,
    logError,
    logSecurityEvent,
    logJourneyStep,
    isLogging,
    logs,
    isLoading,
    error,
    getRecentLogs
  };
}
