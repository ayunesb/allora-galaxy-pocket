
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useTenant } from "./useTenant";

export interface SystemLogEntry {
  event_type: string;
  message: string;
  meta?: Record<string, any>;
  severity?: 'info' | 'warning' | 'error' | 'debug';
}

export function useSystemLogs() {
  const { user } = useAuth();
  const { tenant } = useTenant();

  const logActivity = useMutation({
    mutationFn: async (entry: SystemLogEntry) => {
      if (!tenant?.id) return;
      
      const { error } = await supabase
        .from('system_logs')
        .insert({
          tenant_id: tenant.id,
          user_id: user?.id,
          event_type: entry.event_type,
          message: entry.message,
          meta: entry.meta || {},
          severity: entry.severity || 'info'
        });
        
      if (error) throw error;
    }
  });
  
  const logJourneyStep = async (from: string, to: string, meta?: Record<string, any>) => {
    return logActivity.mutate({
      event_type: 'USER_JOURNEY',
      message: `User navigated from ${from} to ${to}`,
      meta: { from, to, ...meta },
      severity: 'info'
    });
  };
  
  const verifyModuleImplementation = async (modulePath: string, options?: Record<string, any>) => {
    // Simulated verification response for testing purposes
    return {
      verified: true, 
      phase1Complete: Math.random() > 0.3,
      phase2Complete: Math.random() > 0.5,
      phase3Complete: Math.random() > 0.7,
      modulePath,
      options
    };
  };
  
  return {
    logActivity: logActivity.mutate,
    logJourneyStep,
    verifyModuleImplementation,
  };
}
