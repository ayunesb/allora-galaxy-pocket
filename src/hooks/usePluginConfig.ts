
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { Plugin } from "@/types/plugin";
import { toast } from "sonner";

export function usePluginConfig() {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const { tenant } = useTenant();

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

  return {
    updatePluginConfig,
    getPluginConfig,
    isConfiguring
  };
}
