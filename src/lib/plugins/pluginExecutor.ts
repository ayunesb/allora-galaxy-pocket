
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTenant } from "@/hooks/useTenant";
import { logPluginUsage } from "./pluginUsage";
import { Strategy } from "@/types/strategy";
import { useCreditsManager } from "@/hooks/useCreditsManager";

// Plugin execution context with all available data for a plugin run
interface PluginExecutionContext {
  tenant_id: string;
  plugin_key: string;
  operation: string;
  data?: any;
  strategy?: Strategy;
  user_id?: string;
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
      .maybeSingle();
    
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

// React hook for plugin execution with tenant context and billing
export const usePluginExecutor = () => {
  const { tenant } = useTenant();
  const { useCredits } = useCreditsManager();
  
  const executePluginOperation = async (
    pluginKey: string,
    operation: string,
    data?: any,
    strategy?: Strategy,
    creditCost: number = 1
  ) => {
    if (!tenant?.id) {
      toast.error("Cannot execute plugin", {
        description: "No active workspace found"
      });
      return { success: false, error: "No tenant context" };
    }

    // Only charge credits for non-free operations
    if (creditCost > 0) {
      // Charge credits for plugin usage
      const creditSuccess = await useCredits(creditCost, `Plugin: ${pluginKey}`, pluginKey);
      if (!creditSuccess) {
        toast.error("Not enough credits", {
          description: `You need ${creditCost} credits to use this plugin`
        });
        return { success: false, error: "Insufficient credits" };
      }
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
  try {
    // Verify webhook secret if provided
    if (webhookSecret) {
      // Implementation would depend on how your plugins provide webhook authentication
      // This is just a placeholder for the verification logic
    }
    
    // Process webhook payload based on plugin
    console.log(`Processing webhook for plugin ${pluginKey}`);
    
    // This would be implemented in the Edge Function
    return { success: true };
  } catch (error: any) {
    console.error(`Error handling webhook for plugin ${pluginKey}:`, error);
    return { 
      success: false,
      error: error.message || "Unknown error processing webhook"
    };
  }
};

// Get plugin status and configuration
export const getPluginStatus = async (pluginKey: string, tenantId: string) => {
  try {
    const { data, error } = await supabase
      .from("tenant_plugins")
      .select(`
        id, 
        enabled, 
        plugin_key,
        tenant_plugin_configs!inner(config)
      `)
      .eq("tenant_id", tenantId)
      .eq("plugin_key", pluginKey)
      .maybeSingle();
    
    if (error) throw error;
    
    return {
      success: true,
      enabled: data?.enabled || false,
      config: data?.tenant_plugin_configs?.config || {}
    };
  } catch (error: any) {
    console.error(`Error getting plugin status for ${pluginKey}:`, error);
    return {
      success: false,
      enabled: false,
      error: error.message
    };
  }
};
