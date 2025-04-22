
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";

type InstalledPlugin = {
  id: string;
  enabled: boolean;
  plugins: {
    name: string;
    description: string;
    icon_url?: string;
    version: string;
  };
};

export default function MyPluginsPage() {
  const { tenant } = useTenant();
  const [installed, setInstalled] = useState<InstalledPlugin[]>([]);

  useEffect(() => {
    if (!tenant?.id) return;

    const fetchInstalledPlugins = async () => {
      const { data, error } = await supabase
        .from("plugin_installs")
        .select("id, plugin_id, enabled, plugins(name, description, icon_url, version)")
        .eq("tenant_id", tenant.id);
      
      if (error) {
        toast.error("Failed to load installed plugins", {
          description: error.message
        });
        return;
      }

      setInstalled(data || []);
    };

    fetchInstalledPlugins();
  }, [tenant?.id]);

  const togglePlugin = async (id: string, currentStatus: boolean) => {
    if (!tenant?.id) return;

    const { error } = await supabase
      .from("plugin_installs")
      .update({ enabled: !currentStatus })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update plugin status", {
        description: error.message
      });
      return;
    }

    setInstalled(prev => 
      prev.map(p => 
        p.id === id 
          ? { ...p, enabled: !currentStatus } 
          : p
      )
    );

    toast.success(`Plugin ${!currentStatus ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">⚙️ My Installed Plugins</h1>
      
      {installed.length === 0 ? (
        <p className="text-muted-foreground">
          No plugins installed yet. Explore the marketplace to add plugins.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {installed.map((entry) => (
            <Card key={entry.id} className="flex flex-col">
              <CardHeader className="flex-row items-center justify-between">
                <div className="flex items-center space-x-4">
                  {entry.plugins.icon_url && (
                    <img 
                      src={entry.plugins.icon_url} 
                      alt={`${entry.plugins.name} icon`} 
                      className="w-12 h-12 rounded-lg" 
                    />
                  )}
                  <div>
                    <CardTitle>{entry.plugins.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Version: {entry.plugins.version}
                    </p>
                  </div>
                </div>
                <Button 
                  variant={entry.enabled ? "default" : "outline"}
                  onClick={() => togglePlugin(entry.id, entry.enabled)}
                >
                  {entry.enabled ? "Enabled" : "Disabled"}
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {entry.plugins.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
