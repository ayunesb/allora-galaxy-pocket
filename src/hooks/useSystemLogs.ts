
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useTenant } from "./useTenant";

export function useSystemLogs() {
  const { user } = useAuth();
  const { tenant } = useTenant();

  const logActivity = async ({ 
    event_type, 
    message, 
    meta = {}
  }: {
    event_type: string;
    message: string;
    meta?: Record<string, any>;
  }) => {
    try {
      if (!user) return;
      
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        tenant_id: tenant?.id,
        event_type,
        message,
        meta
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  };

  const logSecurityEvent = async (
    message: string,
    event_type = "SECURITY_EVENT",
    meta = {}
  ) => {
    try {
      await supabase.from('security_logs').insert({
        user_id: user?.id || null,
        tenant_id: tenant?.id || null,
        event_type,
        message,
        meta
      });
    } catch (error) {
      console.error("Failed to log security event:", error);
    }
  };

  return { logActivity, logSecurityEvent };
}
