
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useTenant } from "./useTenant";
import { useState } from "react";
import { SystemLog } from "@/types/systemLog";

export interface LogActivityParams {
  event_type: string;
  message: string;
  meta?: Record<string, any>;
  severity?: string; // Add severity support
}

export function useSystemLogs() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [isLogging, setIsLogging] = useState(false);

  const logActivity = async ({ event_type, message, meta = {}, severity = 'info' }: LogActivityParams): Promise<void> => {
    if (!user || !tenant) return;

    try {
      setIsLogging(true);
      await supabase.from('system_logs').insert({
        event_type,
        message,
        meta: { ...meta, severity },
        user_id: user.id,
        tenant_id: tenant.id
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
    } finally {
      setIsLogging(false);
    }
  };

  const logSecurityEvent = async (message: string, eventType: string, meta: Record<string, any> = {}) => {
    if (!user) return;

    try {
      await supabase.from('system_logs').insert({
        event_type: `SECURITY_${eventType}`,
        message,
        meta,
        user_id: user.id,
        tenant_id: tenant?.id || null
      });
    } catch (error) {
      console.error("Failed to log security event:", error);
    }
  };

  const logJourneyStep = async (from: string, to: string, details: Record<string, any> = {}) => {
    return logActivity({
      event_type: 'USER_JOURNEY',
      message: `User navigated from ${from} to ${to}`,
      meta: {
        from,
        to,
        ...details
      },
      severity: 'info'
    });
  };
  
  const verifyModuleImplementation = async (modulePath: string): Promise<any> => {
    try {
      // Implementation for module verification
      const { data, error } = await supabase.rpc('verify_module_implementation', {
        module_path: modulePath
      });
      
      if (error) throw error;
      
      await logActivity({
        event_type: 'MODULE_VERIFICATION',
        message: `Module ${modulePath} verification completed`,
        meta: { result: data },
        severity: 'info'
      });
      
      return data || { 
        phase1Complete: false,
        phase2Complete: false,
        phase3Complete: false,
        verified: false
      };
    } catch (error) {
      console.error(`Error verifying module ${modulePath}:`, error);
      return { 
        phase1Complete: false,
        phase2Complete: false,
        phase3Complete: false,
        verified: false,
        error: true
      };
    }
  };

  return {
    logActivity,
    logSecurityEvent,
    logJourneyStep,
    verifyModuleImplementation,
    isLogging
  };
}
