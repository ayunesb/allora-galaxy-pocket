
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";

type Plugin = {
  id: string;
  name: string;
  description: string;
  badge?: string;
  version: string;
  author: string;
  icon_url?: string;
  changelog?: any[];
};

export default function PluginExplorePage() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const { tenant } = useTenant();

  useEffect(() => {
    const fetchPlugins = async () => {
      const { data, error } = await supabase.from("plugins").select("*");
      if (error) {
        toast.error("Failed to load plugins", {
          description: error.message
        });
      } else if (data) {
        setPlugins(data);
      }
    };

    fetchPlugins();
  }, []);

  const installPlugin = async (pluginId: string) => {
    if (!tenant?.id) {
      toast.error("No tenant selected");
      return;
    }

    const { error } = await supabase.from("plugin_installs").insert({
      tenant_id: tenant.id,
      plugin_id: pluginId,
      enabled: true
    });

    if (error) {
      toast.error("Failed to install plugin", {
        description: error.message
      });
    } else {
      toast.success("Plugin installed successfully");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🛒 Plugin Marketplace</h1>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plugins.map((plugin) => (
          <Card key={plugin.id} className="flex flex-col">
            <CardHeader className="flex-row items-center justify-between space-y-0 space-x-4">
              <div className="flex items-center space-x-4">
                {plugin.icon_url && (
                  <img 
                    src={plugin.icon_url} 
                    alt={`${plugin.name} icon`} 
                    className="w-12 h-12 rounded-lg" 
                  />
                )}
                <div>
                  <CardTitle>{plugin.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{plugin.version}</p>
                </div>
              </div>
              {plugin.badge && (
                <span 
                  className={`text-xs px-2 py-1 rounded-full ${
                    plugin.badge === "Top Rated" ? "bg-green-300" :
                    plugin.badge === "Most Used" ? "bg-purple-300" :
                    "bg-yellow-300"
                  }`}
                >
                  {plugin.badge}
                </span>
              )}
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
              <p className="text-sm text-muted-foreground mb-4">
                {plugin.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  By {plugin.author}
                </span>
                <Button onClick={() => installPlugin(plugin.id)}>
                  Install
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
