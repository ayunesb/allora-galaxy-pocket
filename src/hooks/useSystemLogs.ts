
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type SystemLogEntry = {
  event_type: string;
  message: string;
  meta?: Record<string, any>;
  tenant_id?: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
};

export function useSystemLogs() {
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
  
  return {
    logActivity: (entry: SystemLogEntry) => logActivityMutation.mutateAsync(entry),
    isLogging: logActivityMutation.isPending
  };
}
