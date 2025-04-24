import { useState, useEffect } from "react";
import { useTenant } from "@/hooks/useTenant";
import { usePlugins } from "@/hooks/usePlugins";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Plugin } from "@/types/plugin";

const allPlugins: Plugin[] = [
  { id: "1", key: "stripe", name: "Stripe", description: "Billing, plans, usage", version: "1.0.0" },
  { id: "2", key: "hubspot", name: "HubSpot", description: "CRM & contacts sync", version: "1.0.0" },
  { id: "3", key: "shopify", name: "Shopify", description: "Product + order sync", version: "1.0.0" },
  { id: "4", key: "ga4", name: "Google Analytics", description: "Traffic & funnel data", version: "1.0.0" },
  { id: "5", key: "twilio", name: "Twilio", description: "SMS & voice actions", version: "1.0.0" }
];

export default function PluginsDashboard() {
  const { tenant } = useTenant();
  const { refreshPlugins } = usePlugins();
  const [isLoading, setIsLoading] = useState(true);
  const [enabled, setEnabled] = useState<Plugin['key'][]>([]);

  useEffect(() => {
    async function loadPlugins() {
      if (!tenant?.id) return;
      
      const { data, error } = await supabase
        .from('tenant_plugins')
        .select('plugin_key, enabled')
        .eq('tenant_id', tenant.id);
      
      if (error) {
        toast.error("Failed to load plugins");
        return;
      }

      setEnabled(data?.filter(p => p.enabled).map(p => p.plugin_key as Plugin['key']) || []);
      setIsLoading(false);
    }

    loadPlugins();
  }, [tenant?.id]);

  const toggle = async (key: Plugin['key']) => {
    if (!tenant?.id) return;
    
    try {
      const newEnabled = enabled.includes(key);
      
      const { error } = await supabase
        .from('tenant_plugins')
        .upsert({
          tenant_id: tenant.id,
          plugin_key: key,
          enabled: !newEnabled
        });

      if (error) throw error;

      setEnabled(prev => 
        newEnabled 
          ? prev.filter(k => k !== key)
          : [...prev, key]
      );
      
      await refreshPlugins();
      toast.success(`${key} plugin ${newEnabled ? 'disabled' : 'enabled'}`);
    } catch (error) {
      console.error('Error toggling plugin:', error);
      toast.error("Failed to update plugin status");
    }
  };

  if (!tenant?.id) {
    return <div className="p-6">Please select a tenant first</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">
        🧩 Plugins for {tenant?.name || 'Loading...'}
      </h2>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-20 bg-muted" />
              <CardContent className="h-16 bg-muted mt-2" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allPlugins.map((plugin) => (
            <Card key={plugin.key}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-lg">
                  <span>{plugin.name}</span>
                  <Switch
                    checked={enabled.includes(plugin.key)}
                    onCheckedChange={() => toggle(plugin.key)}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{plugin.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
