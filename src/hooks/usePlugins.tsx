
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";

type PluginContextType = {
  activePlugins: string[];
  refreshPlugins: () => Promise<void>;
  isLoading: boolean;
};

const PluginContext = createContext<PluginContextType | undefined>(undefined);

export function PluginProvider({ children }: { children: ReactNode }) {
  const { tenant } = useTenant();
  const [activePlugins, setActivePlugins] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshPlugins = async () => {
    if (!tenant?.id) {
      setActivePlugins([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("tenant_plugins")
        .select("plugin_key")
        .eq("tenant_id", tenant.id)
        .eq("enabled", true);

      if (error) throw error;
      
      setActivePlugins(data.map((p) => p.plugin_key));
    } catch (error) {
      console.error("[PluginContext] Error:", error);
      setActivePlugins([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshPlugins();
  }, [tenant?.id]);

  return (
    <PluginContext.Provider value={{ activePlugins, refreshPlugins, isLoading }}>
      {children}
    </PluginContext.Provider>
  );
}

export function usePlugins() {
  const context = useContext(PluginContext);
  if (!context) {
    throw new Error("usePlugins must be used within PluginProvider");
  }
  return context;
}
