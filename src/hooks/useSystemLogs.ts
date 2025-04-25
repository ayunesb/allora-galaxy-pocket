
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useTenant } from "./useTenant";

interface LogActivityParams {
  event_type: string;
  message: string;
  meta?: Record<string, any>;
}

export function useSystemLogs() {
  const { user } = useAuth();
  const { tenant } = useTenant();

  const logActivity = async ({ event_type, message, meta = {} }: LogActivityParams) => {
    if (!user || !tenant) return;

    try {
      await supabase.from('system_logs').insert({
        event_type,
        message,
        meta,
        user_id: user.id,
        tenant_id: tenant.id
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
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

  return {
    logActivity,
    logSecurityEvent
  };
}
