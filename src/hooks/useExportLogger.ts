
import { useTenant } from "./useTenant";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export function useExportLogger() {
  const { tenant } = useTenant();
  const { user } = useAuth();

  const logExport = async (type: string, method: 'csv' | 'pdf' | 'email', recordCount: number, recipients?: string[]) => {
    if (!tenant?.id || !user?.id) return;
    try {
      await supabase
        .from('system_logs')
        .insert({
          tenant_id: tenant.id,
          user_id: user.id,
          event_type: `export_${method}`,
          message: `Exported ${type} data as ${method}${recipients ? ' and sent via email' : ''}`,
          meta: {
            export_type: type,
            export_method: method,
            record_count: recordCount,
            recipients
          }
        });
    } catch (error) {
      console.error('Failed to log export activity:', error);
    }
  };

  return { logExport };
}
