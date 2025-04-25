
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";

interface LogParams {
  event_type: string;
  message: string;
  meta?: Record<string, any>;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

export function useSystemLogs() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  
  const logActivity = useCallback(
    async ({ event_type, message, meta = {}, severity = 'info' }: LogParams) => {
      try {
        if (!user || !tenant) return;
        
        await supabase.from("system_logs").insert({
          event_type,
          message,
          user_id: user.id,
          tenant_id: tenant.id,
          meta: {
            ...meta,
            severity
          }
        });
      } catch (error) {
        console.error("Failed to log activity:", error);
      }
    },
    [user, tenant]
  );

  const logSecurityEvent = useCallback(
    async (message: string, event_type = "SECURITY_EVENT", meta = {}) => {
      return logActivity({
        event_type,
        message,
        meta: { ...meta, security: true },
        severity: 'warning'
      });
    },
    [logActivity]
  );
  
  const logJourneyStep = useCallback(
    async (step: string, status: string, details = {}) => {
      return logActivity({
        event_type: "JOURNEY_STEP",
        message: `${step}: ${status}`,
        meta: details,
        severity: 'info'
      });
    },
    [logActivity]
  );
  
  const verifyModuleImplementation = useCallback(
    async (module: string, isImplemented: boolean, details = {}) => {
      return logActivity({
        event_type: "MODULE_VERIFICATION",
        message: `${module} verification: ${isImplemented ? 'PASS' : 'FAIL'}`,
        meta: { ...details, implemented: isImplemented },
        severity: isImplemented ? 'info' : 'warning'
      });
    },
    [logActivity]
  );

  return {
    logActivity,
    logSecurityEvent,
    logJourneyStep,
    verifyModuleImplementation
  };
}
