
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";
import { Plugin } from "@/types/plugin";
import { usePlugins } from "./usePlugins";

export function usePluginManager() {
  const [isInstalling, setIsInstalling] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
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
            config: getDefaultConfig(pluginKey)
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

  const updatePluginConfig = async (pluginKey: Plugin['key'], config: Record<string, any>) => {
    if (!tenant?.id) {
      toast.error("No active workspace");
      return false;
    }

    setIsConfiguring(true);
    try {
      const { error } = await supabase.functions.invoke('plugin-config', {
        body: {
          tenant_id: tenant.id,
          plugin_key: pluginKey,
          config
        }
      });

      if (error) throw error;
      
      toast.success(`${pluginKey} configuration updated`);
      return true;
    } catch (error) {
      console.error("Error updating plugin config:", error);
      toast.error(`Failed to update ${pluginKey} configuration`);
      return false;
    } finally {
      setIsConfiguring(false);
    }
  };

  const getPluginConfig = async (pluginKey: Plugin['key']) => {
    if (!tenant?.id) return {};

    try {
      const { data, error } = await supabase.functions.invoke('plugin-config', {
        body: {
          method: 'GET',
          tenant_id: tenant.id,
          plugin_key: pluginKey
        }
      });

      if (error) throw error;
      
      return data?.config || {};
    } catch (error) {
      console.error("Error fetching plugin config:", error);
      return {};
    }
  };

  // Provide default configuration templates for each plugin
  const getDefaultConfig = (pluginKey: Plugin['key']): Record<string, any> => {
    switch (pluginKey) {
      case 'stripe':
        return {
          webhook_url: '',
          public_key: '',
          payment_methods: ['card'],
          currency: 'USD'
        };
      case 'hubspot':
        return {
          portal_id: '',
          webhook_url: '',
          sync_enabled: true
        };
      case 'shopify':
        return {
          shop_domain: '',
          api_version: '2023-07',
          sync_products: true,
          sync_orders: true
        };
      case 'ga4':
        return {
          property_id: '',
          measurement_id: '',
          auto_track: true
        };
      case 'twilio':
        return {
          phone_number: '',
          message_template: 'Hello {name}, thank you for your interest in our services.'
        };
      default:
        return {};
    }
  };

  return {
    installPlugin,
    uninstallPlugin,
    updatePluginConfig,
    getPluginConfig,
    isInstalling,
    isConfiguring
  };
}
