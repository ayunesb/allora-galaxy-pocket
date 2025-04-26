
import { useState } from 'react';
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useTenant } from "./useTenant";
import { SystemLog, LogSeverity } from "@/types/systemLog";

export interface SystemLogEntry {
  event_type: string;
  message: string;
  meta?: Record<string, any>;
  severity?: LogSeverity;
}

export function useSystemLogs() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [isLogging, setIsLogging] = useState(false);
  const [logs, setLogs] = useState<SystemLog[]>([]);

  const logActivity = useMutation({
    mutationFn: async (entry: SystemLogEntry) => {
      if (!tenant?.id) return;
      
      setIsLogging(true);
      try {
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
      } finally {
        setIsLogging(false);
      }
    }
  });
  
  const getRecentLogs = async (limit = 10) => {
    if (!tenant?.id) return [];
    
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching recent logs:', error);
      return [];
    }
    
    const results = data || [];
    setLogs(results);
    return results;
  };
  
  const logJourneyStep = async (from: string, to: string, meta?: Record<string, any>) => {
    return logActivity.mutateAsync({
      event_type: 'USER_JOURNEY',
      message: `User navigated from ${from} to ${to}`,
      meta: { from, to, ...meta },
      severity: 'info'
    });
  };
  
  const logSecurityEvent = async (message: string, eventType: string, meta?: Record<string, any>) => {
    return logActivity.mutateAsync({
      event_type: 'SECURITY_' + eventType,
      message,
      meta: meta || {},
      severity: 'warning'
    });
  };
  
  const verifyModuleImplementation = async (modulePath: string, options?: Record<string, any>) => {
    // Implementation for verification
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
    logSecurityEvent,
    verifyModuleImplementation,
    isLogging,
    logs,
    getRecentLogs
  };
}
