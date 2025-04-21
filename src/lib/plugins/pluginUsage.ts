
import { supabase } from "@/integrations/supabase/client";

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
