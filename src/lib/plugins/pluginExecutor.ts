
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTenant } from "@/hooks/useTenant";
import { logPluginUsage } from "./pluginUsage";
import { Strategy } from "@/types/strategy";

// Plugin execution context with all available data for a plugin run
interface PluginExecutionContext {
  tenant_id: string;
  plugin_key: string;
  operation: string;
  data?: any;
  strategy?: Strategy;
}

export const executePlugin = async (context: PluginExecutionContext): Promise<{
  success: boolean;
  result?: any;
  error?: string;
}> => {
  try {
    // First check if plugin is enabled for this tenant
    const { data: pluginData, error: pluginError } = await supabase
      .from("tenant_plugins")
      .select("enabled, id")
      .eq("tenant_id", context.tenant_id)
      .eq("plugin_key", context.plugin_key)
      .single();
    
    if (pluginError || !pluginData?.enabled) {
      return {
        success: false,
        error: `Plugin ${context.plugin_key} is not enabled for this workspace`
      };
    }
    
    // Get plugin configuration
    const { data: pluginConfig, error: configError } = await supabase
      .from("tenant_plugin_configs")
      .select("config")
      .eq("tenant_id", context.tenant_id)
      .eq("plugin_key", context.plugin_key)
      .single();
    
    if (configError) {
      console.warn(`No configuration found for plugin ${context.plugin_key}`);
    }
    
    // Log usage attempt
    await logPluginUsage({
      tenant_id: context.tenant_id,
      plugin_key: context.plugin_key,
      event: `execute_${context.operation}`
    });
    
    // Execute plugin via edge function
    const { data, error } = await supabase.functions.invoke("execute-plugin", {
      body: {
        plugin_key: context.plugin_key,
        operation: context.operation,
        config: pluginConfig?.config || {},
        data: context.data,
        strategy: context.strategy,
        tenant_id: context.tenant_id
      }
    });
    
    if (error) {
      throw new Error(`Plugin execution failed: ${error.message}`);
    }
    
    // Log successful execution
    await logPluginUsage({
      tenant_id: context.tenant_id,
      plugin_key: context.plugin_key,
      event: `${context.operation}_success`
    });
    
    return {
      success: true,
      result: data
    };
    
  } catch (err: any) {
    console.error(`Plugin execution error (${context.plugin_key}/${context.operation}):`, err);
    
    // Log failed execution
    await logPluginUsage({
      tenant_id: context.tenant_id,
      plugin_key: context.plugin_key,
      event: `${context.operation}_error`
    });
    
    return {
      success: false,
      error: err.message || "Unknown error executing plugin"
    };
  }
};

// React hook for plugin execution with tenant context
export const usePluginExecutor = () => {
  const { tenant } = useTenant();
  
  const executePluginOperation = async (
    pluginKey: string,
    operation: string,
    data?: any,
    strategy?: Strategy
  ) => {
    if (!tenant?.id) {
      toast.error("Cannot execute plugin", {
        description: "No active workspace found"
      });
      return { success: false, error: "No tenant context" };
    }
    
    const result = await executePlugin({
      tenant_id: tenant.id,
      plugin_key: pluginKey,
      operation,
      data,
      strategy
    });
    
    if (!result.success) {
      toast.error(`Plugin operation failed`, {
        description: result.error || "An unexpected error occurred"
      });
    }
    
    return result;
  };
  
  return { executePluginOperation };
};

// Handle plugin webhooks (used in Edge Function)
export const handlePluginWebhook = async (pluginKey: string, payload: any, webhookSecret?: string) => {
  // This function would be implemented in the Edge Function
  // Just defining the interface here for reference
  return { success: true };
};
