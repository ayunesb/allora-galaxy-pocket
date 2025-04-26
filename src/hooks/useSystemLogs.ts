
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export type SystemLogEntry = {
  event_type: string;
  message: string;
  meta?: Record<string, any>;
  tenant_id?: string;
  severity?: 'info' | 'warning' | 'error' | 'critical' | 'success';
};

export type SystemLog = {
  id: string;
  created_at: string;
  tenant_id?: string;
  user_id?: string;
  event_type: string;
  message: string;
  meta?: Record<string, any>;
  severity?: 'info' | 'warning' | 'error' | 'critical' | 'success';
};

export function useSystemLogs() {
  const [logs, setLogs] = useState<SystemLog[]>([]);

  const logActivity = async (logEntry: SystemLogEntry) => {
    try {
      // Get current user and tenant
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        console.warn("Cannot log activity: No authenticated user");
        return { success: false, error: "No authenticated user" };
      }
      
      const { error } = await supabase
        .from('system_logs')
        .insert({
          user_id: userId,
          tenant_id: logEntry.tenant_id,
          event_type: logEntry.event_type,
          message: logEntry.message,
          meta: logEntry.meta || {},
          severity: logEntry.severity || 'info'
        });
        
      if (error) {
        console.error("Error logging activity:", error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (err: any) {
      console.error("System log error:", err);
      return { success: false, error: err.message };
    }
  };
  
  const logActivityMutation = useMutation({
    mutationFn: logActivity,
    onError: (error) => {
      console.error("Failed to log activity:", error);
    }
  });

  // Add function to get recent logs
  const getRecentLogs = async (limit = 50) => {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) {
        throw error;
      }
      
      setLogs(data || []);
      return data;
    } catch (err) {
      console.error("Error fetching system logs:", err);
      toast.error("Failed to fetch system logs");
      throw err;
    }
  };

  // Add function for security events
  const logSecurityEvent = async (
    message: string,
    eventType: string,
    meta: Record<string, any> = {}
  ) => {
    return logActivity({
      event_type: `SECURITY_${eventType}`,
      message,
      meta,
      severity: 'warning'
    });
  };

  // Add function for journey steps
  const logJourneyStep = async (
    from: string,
    to: string,
    details: Record<string, any> = {}
  ) => {
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

  // Add function for module verification
  const verifyModuleImplementation = async (
    modulePath: string,
    options: Record<string, any> = {}
  ) => {
    try {
      // Mock implementation for module verification
      console.log(`Verifying module: ${modulePath}`, options);
      
      // In a real implementation, this would make an API call to verify the module
      return {
        verified: true,
        phase1Complete: Math.random() > 0.3,
        phase2Complete: Math.random() > 0.4,
        phase3Complete: Math.random() > 0.5,
        modulePath,
        options
      };
    } catch (err) {
      console.error(`Error verifying module ${modulePath}:`, err);
      return { 
        verified: false, 
        error: true,
        modulePath 
      };
    }
  };

  return {
    logActivity: (entry: SystemLogEntry) => logActivityMutation.mutateAsync(entry),
    isLogging: logActivityMutation.isPending,
    logs,
    getRecentLogs,
    logSecurityEvent,
    logJourneyStep,
    verifyModuleImplementation
  };
}
