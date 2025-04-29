
import { useTenant } from "./useTenant";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export function usePluginLogger() {
  const { tenant } = useTenant();
  const { user } = useAuth();

  const logUsage = async (pluginKey: string, event: string, source?: string) => {
    if (!tenant?.id) {
      console.warn("Cannot log plugin usage: No tenant ID");
      return false;
    }
    
    try {
      // Use a helper function to log plugin usage
      await logPluginUsage({
        tenant_id: tenant.id,
        plugin_key: pluginKey,
        event: event,
        amount: 1
      });
      
      // Also log to local system logs for analytics
      await supabase.from('plugin_usage_logs').insert({
        tenant_id: tenant.id,
        plugin_key: pluginKey,
        event: event,
        event_type: source ? source : 'interaction',
        count: 1
      } as any);
      
      return true;
    } catch (error) {
      console.error("Failed to log plugin usage:", error);
      return false;
    }
  };
  
  return { logUsage };
}

// Helper function to log plugin usage
export async function logPluginUsage({
  tenant_id,
  plugin_key,
  event,
  amount = 1
}: {
  tenant_id: string;
  plugin_key: string;
  event: string;
  amount?: number;
}) {
  try {
    const { error } = await supabase.functions.invoke('log-plugin-usage', {
      body: {
        tenant_id,
        plugin_key,
        event,
        count: amount
      }
    });

    if (error) {
      console.error("[Billing] Plugin usage log failed:", error.message);
    }
  } catch (err) {
    console.error("[Billing] Plugin usage logging error:", err);
  }
}
