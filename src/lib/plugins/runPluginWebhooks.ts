
import { supabase } from "@/integrations/supabase/client";
import type { Strategy } from "@/types/strategy";

export async function runPluginWebhooks(pluginKey: string, strategy: Strategy) {
  try {
    // Check if the plugin is enabled for the tenant
    const { data: pluginData, error: pluginError } = await supabase
      .from('tenant_plugins')
      .select('enabled, tenant_plugins.tenant_id, tenant_plugin_configs.config')
      .eq('plugin_key', pluginKey)
      .eq('enabled', true)
      .join('tenant_plugin_configs', { 
        foreignKey: ['tenant_id', 'plugin_key'],
        type: 'left'
      })
      .single();

    if (pluginError || !pluginData?.enabled) {
      console.log(`[Webhook] Plugin ${pluginKey} not enabled or error:`, pluginError);
      return;
    }

    // Get webhook URL from plugin config
    const webhookUrl = pluginData.config?.webhook_url;
    if (!webhookUrl) {
      console.log(`[Webhook] No webhook URL configured for plugin ${pluginKey}`);
      return;
    }

    // Send webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-Plugin-Key": pluginKey
      },
      body: JSON.stringify({ 
        strategy,
        tenant_id: pluginData.tenant_id,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status}`);
    }

    console.log(`[Webhook] Successfully triggered for ${pluginKey}`);
  } catch (error) {
    console.error(`[Webhook] Error triggering webhook for ${pluginKey}:`, error);
  }
}
