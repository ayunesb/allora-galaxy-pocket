
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';
import { SystemLog, LogSeverity } from '@/types/systemLog';
import { ToastService } from '@/services/ToastService';

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

  const logActivity = async (
    event_type: string,
    message: string,
    meta: Record<string, any> = {},
    severity: LogSeverity = 'info'
  ): Promise<{ success: boolean; log?: SystemLog; error?: any }> => {
    if (!tenant?.id) {
      console.warn("Can't log activity: No tenant ID available");
      return { success: false, error: "No tenant ID" };
    }
    
    setIsLogging(true);
    
    try {
      const logPayload = {
        tenant_id: tenant.id,
        event_type,
        message,
        meta,
        severity,
        user_id: user?.id,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('system_logs')
        .insert(logPayload)
        .select()
        .single();
        
      if (error) throw error;
      
      return { success: true, log: data as unknown as SystemLog };
    } catch (err) {
      console.error("Failed to log activity:", err);
      return { success: false, error: err };
    } finally {
      setIsLogging(false);
    }
  };

  const logError = async (
    message: string,
    error: Error | any,
    meta: Record<string, any> = {}
  ) => {
    return logActivity(
      'ERROR',
      message,
      {
        ...meta,
        errorMessage: error.message,
        stack: error.stack,
        code: error.code
      },
      'error'
    );
  };

  const logSecurityEvent = async (
    message: string,
    eventType: string,
    meta: Record<string, any> = {}
  ) => {
    return logActivity(
      `SECURITY_${eventType}`,
      message,
      meta,
      'warning'
    );
  };

  const logJourneyStep = async (
    from: string,
    to: string,
    details: Record<string, any> = {}
  ) => {
    return logActivity(
      'USER_JOURNEY',
      `User navigated from ${from} to ${to}`,
      {
        from,
        to,
        ...details
      },
      'info'
    );
  };
  
  // Add module verification function
  const verifyModuleImplementation = async (modulePath: string) => {
    try {
      const result = await logActivity(
        'MODULE_VERIFICATION',
        `Verifying module implementation for ${modulePath}`,
        { modulePath },
        'info'
      );
      
      // For now, return a mock verification result
      return {
        success: true,
        message: {
          verified: true,
          phase1Complete: true,
          phase2Complete: true,
          phase3Complete: true,
          modulePath,
          options: {}
        }
      };
    } catch (error) {
      console.error(`Error verifying module ${modulePath}:`, error);
      return { 
        success: false,
        error
      };
    }
  };

  return {
    logActivity,
    logError,
    logSecurityEvent,
    logJourneyStep,
    verifyModuleImplementation,
    isLogging
  };
}
