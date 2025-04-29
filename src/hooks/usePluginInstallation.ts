
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { Plugin, PluginKey } from "@/types/plugin";
import { toast } from "sonner";
import { usePlugins } from "./usePlugins";
import { useSystemLogs } from "./useSystemLogs";

export function usePluginInstallation() {
  const [isInstalling, setIsInstalling] = useState(false);
  const { tenant } = useTenant();
  const { refreshPlugins } = usePlugins();
  const { logActivity } = useSystemLogs();

  const installPlugin = async (pluginKey: Plugin['key']) => {
    if (!tenant?.id) {
      toast.error("No active workspace found", {
        description: "Please select a workspace to install plugins"
      });
      return false;
    }

    setIsInstalling(true);
    try {
      // Check if plugin is already installed
      const { data: existing, error: checkError } = await supabase
        .from("tenant_plugins")
        .select("id")
        .eq("tenant_id", tenant.id)
        .eq("plugin_key", pluginKey)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // This is an unexpected error (not just "no rows returned")
        console.error("Error checking plugin installation:", checkError);
        throw checkError;
      }

      if (existing) {
        // Just enable the plugin if it exists
        const { error } = await supabase
          .from("tenant_plugins")
          .update({ enabled: true })
          .eq("id", existing.id)
          .eq("tenant_id", tenant.id); // Add tenant check for extra security

        if (error) throw error;
      } else {
        // Install the plugin
        const { error } = await supabase
          .from("tenant_plugins")
          .insert({
            tenant_id: tenant.id,
            plugin_key: pluginKey,
            enabled: true
          });

        if (error) throw error;
      }

      // Create default config if needed
      const { data: configData, error: configCheckError } = await supabase
        .from("tenant_plugin_configs")
        .select("id")
        .eq("tenant_id", tenant.id)
        .eq("plugin_key", pluginKey)
        .single();

      if (configCheckError && configCheckError.code !== 'PGRST116') {
        // This is an unexpected error
        console.error("Error checking plugin config:", configCheckError);
        // Continue despite error - non-critical
      }

      if (!configData) {
        await supabase
          .from("tenant_plugin_configs")
          .insert({
            tenant_id: tenant.id,
            plugin_key: pluginKey,
            config: {}
          });
      }

      // Log plugin installation - use correct structure for system_logs
      try {
        await logActivity({
          event_type: "PLUGIN_INSTALLED",
          message: `Plugin ${pluginKey} was installed`,
          meta: {
            plugin_key: pluginKey
          },
          severity: "info"
        });
      } catch (logError) {
        console.error("Failed to log plugin installation:", logError);
        // Non-critical, continue despite error
      }

      // Track plugin usage
      try {
        await supabase
          .from("plugin_usage_logs")
          .insert({
            tenant_id: tenant.id,
            plugin_key: pluginKey,
            event: "install",
            event_type: "activation"
          });
      } catch (usageError) {
        console.error("Failed to log plugin usage:", usageError);
        // Non-critical, continue despite error
      }

      await refreshPlugins();
      toast.success(`${pluginKey} plugin installed successfully`);
      return true;
    } catch (error) {
      console.error("Error installing plugin:", error);
      toast.error(`Failed to install ${pluginKey} plugin`, {
        description: error instanceof Error ? error.message : "Unknown error"
      });
      return false;
    } finally {
      setIsInstalling(false);
    }
  };

  const uninstallPlugin = async (pluginKey: Plugin['key']) => {
    if (!tenant?.id) {
      toast.error("No active workspace");
      return false;
    }

    setIsInstalling(true);
    try {
      // Only disable plugins that belong to the current tenant
      const { error } = await supabase
        .from("tenant_plugins")
        .update({ enabled: false })
        .eq("tenant_id", tenant.id)
        .eq("plugin_key", pluginKey);

      if (error) throw error;

      // Log plugin uninstallation - using correct structure
      try {
        await logActivity({
          event_type: "PLUGIN_DISABLED",
          message: `Plugin ${pluginKey} was disabled`,
          meta: {
            plugin_key: pluginKey
          },
          severity: "info"
        });
      } catch (logError) {
        console.error("Failed to log plugin disabling:", logError);
      }

      await refreshPlugins();
      toast.success(`${pluginKey} plugin disabled`);
      return true;
    } catch (error) {
      console.error("Error disabling plugin:", error);
      toast.error(`Failed to disable ${pluginKey} plugin`);
      return false;
    } finally {
      setIsInstalling(false);
    }
  };

  return {
    installPlugin,
    uninstallPlugin,
    isInstalling
  };
}
