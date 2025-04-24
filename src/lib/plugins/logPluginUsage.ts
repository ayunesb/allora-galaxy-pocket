
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { Plugin } from "@/types/plugin";

/**
 * Log plugin usage to track metrics and plugin effectiveness
 */
export async function logPluginUsage({
  tenant_id,
  plugin_key,
  event,
  page = null,
  count = 1,
  metadata = {}
}: {
  tenant_id: string;
  plugin_key: Plugin['key'];
  event: string;
  page?: string | null;
  count?: number;
  metadata?: Record<string, any>;
}) {
  try {
    const { error } = await supabase
      .from('plugin_usage_logs')
      .insert({
        tenant_id,
        plugin_key,
        event,
        page,
        count,
        event_type: 'usage'
      });

    if (error) {
      console.error("[Plugin] Usage log failed:", error);
    }
  } catch (err) {
    console.error("[Plugin] Usage logging error:", err);
  }
}

/**
 * React hook for logging plugin usage in components
 */
export function usePluginLogger() {
  const { tenant } = useTenant();
  
  const logUsage = async (plugin_key: Plugin['key'], event: string, page?: string, count: number = 1) => {
    if (!tenant?.id) return;
    
    await logPluginUsage({
      tenant_id: tenant.id,
      plugin_key,
      event,
      page,
      count
    });
  };

  const logConfiguration = async (plugin_key: Plugin['key']) => {
    if (!tenant?.id) return;
    
    await logUsage(plugin_key, 'configured', 'settings');
  };
  
  const logActivation = async (plugin_key: Plugin['key']) => {
    if (!tenant?.id) return;
    
    await logUsage(plugin_key, 'activated', 'settings');
  };
  
  const logDeactivation = async (plugin_key: Plugin['key']) => {
    if (!tenant?.id) return;
    
    await logUsage(plugin_key, 'deactivated', 'settings');
  };
  
  return { 
    logUsage,
    logConfiguration,
    logActivation,
    logDeactivation
  };
}
