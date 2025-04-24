
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { PluginKey } from "@/types/plugin";
import { toast } from "sonner";
import { logPluginUsage } from "./logPluginUsage";

// Plugin operation context
interface PluginExecutionContext {
  tenant_id: string;
  plugin_key: PluginKey;
  operation: string;
  data?: any;
  user_id?: string;
}

/**
 * Execute a plugin operation via edge function
 */
export const executePlugin = async (context: PluginExecutionContext): Promise<{
  success: boolean;
  result?: any;
  error?: string;
}> => {
  try {
    // First check if plugin is enabled for this tenant
    const { data: pluginData, error: pluginError } = await supabase
      .from("tenant_plugins")
      .select("enabled")
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
    const { data: pluginConfigs, error: configError } = await supabase
      .from("tenant_plugin_configs")
      .select("config")
      .eq("tenant_id", context.tenant_id)
      .eq("plugin_key", context.plugin_key)
      .single();
    
    // Handle configuration
    const pluginConfig = pluginConfigs?.config || {};
    
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
        config: pluginConfig || {},
        data: context.data,
        tenant_id: context.tenant_id,
        user_id: context.user_id
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
    pluginKey: PluginKey,
    operation: string,
    data?: any
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
      data
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
