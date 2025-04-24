
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { Plugin } from "@/types/plugin";
import { toast } from "sonner";
import { usePlugins } from "./usePlugins";

export function usePluginInstallation() {
  const [isInstalling, setIsInstalling] = useState(false);
  const { tenant } = useTenant();
  const { refreshPlugins } = usePlugins();

  const installPlugin = async (pluginKey: Plugin['key']) => {
    if (!tenant?.id) {
      toast.error("No active workspace");
      return false;
    }

    setIsInstalling(true);
    try {
      // Check if plugin is already installed
      const { data: existing } = await supabase
        .from("tenant_plugins")
        .select("id")
        .eq("tenant_id", tenant.id)
        .eq("plugin_key", pluginKey)
        .single();

      if (existing) {
        // Just enable the plugin if it exists
        const { error } = await supabase
          .from("tenant_plugins")
          .update({ enabled: true })
          .eq("id", existing.id);

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
      const { data: configData } = await supabase
        .from("tenant_plugin_configs")
        .select("id")
        .eq("tenant_id", tenant.id)
        .eq("plugin_key", pluginKey)
        .single();

      if (!configData) {
        await supabase
          .from("tenant_plugin_configs")
          .insert({
            tenant_id: tenant.id,
            plugin_key: pluginKey,
            config: {}
          });
      }

      await refreshPlugins();
      toast.success(`${pluginKey} plugin installed successfully`);
      return true;
    } catch (error) {
      console.error("Error installing plugin:", error);
      toast.error(`Failed to install ${pluginKey} plugin`);
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
      const { error } = await supabase
        .from("tenant_plugins")
        .update({ enabled: false })
        .eq("tenant_id", tenant.id)
        .eq("plugin_key", pluginKey);

      if (error) throw error;

      await refreshPlugins();
      toast.success(`${pluginKey} plugin disabled`);
      return true;
    } catch (error) {
      console.error("Error uninstalling plugin:", error);
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
