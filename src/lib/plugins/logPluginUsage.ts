
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";

/**
 * Log plugin usage to help track metrics
 */
export async function logPluginUsage({
  tenant_id,
  plugin_key,
  event,
  page = null,
  count = 1
}: {
  tenant_id: string;
  plugin_key: string;
  event: string;
  page?: string | null;
  count?: number;
}) {
  try {
    const { error } = await supabase
      .from('plugin_usage_logs')
      .insert({
        tenant_id,
        plugin_key,
        event,
        page,
        count
      });

    if (error) {
      console.error("[Plugin] Usage log failed:", error);
    }
  } catch (err) {
    console.error("[Plugin] Usage logging error:", err);
  }
}

/**
 * React hook for logging plugin usage
 */
export function usePluginLogger() {
  const { tenant } = useTenant();
  
  const logUsage = async (plugin_key: string, event: string, page?: string, count: number = 1) => {
    if (!tenant?.id) return;
    
    await logPluginUsage({
      tenant_id: tenant.id,
      plugin_key,
      event,
      page,
      count
    });
  };
  
  return { logUsage };
}
