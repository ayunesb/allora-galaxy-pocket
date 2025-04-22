
'use client';

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { usePlugins } from "@/hooks/usePlugins";
import { pluginList } from "@/lib/plugins/pluginList";
import { toast } from "sonner";
import PluginConfigEditor from "@/app/admin/plugins/PluginConfigEditor";
import { useRolePermissions } from "@/hooks/useRolePermissions";

export default function PluginSettings() {
  const { activePlugins, refreshPlugins } = usePlugins();
  const { canManagePlugins } = useRolePermissions();
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);

  // Save plugin config changes
  const handleSaveConfig = async (pluginKey: string, config: Record<string, string>) => {
    try {
      const { error } = await supabase
        .from('tenant_plugin_configs')
        .upsert({
          plugin_key: pluginKey,
          config,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      toast.success("Plugin settings saved successfully");
      await refreshPlugins();
    } catch (error) {
      console.error('Error saving plugin config:', error);
      toast.error("Failed to save plugin settings");
    }
  };

  if (!canManagePlugins) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">🔌 Plugin Settings</h1>
        <p className="text-muted-foreground">
          You don't have permission to manage plugins. Please contact your administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🔌 Plugin Settings</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Available Plugins</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pluginList.map((plugin) => (
                  <div
                    key={plugin.key}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedPlugin(plugin.key)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{plugin.icon}</span>
                        <h3 className="font-medium">{plugin.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {plugin.description}
                      </p>
                    </div>
                    <Switch
                      checked={activePlugins.includes(plugin.key)}
                      onCheckedChange={async () => {
                        try {
                          const { error } = await supabase
                            .from('tenant_plugins')
                            .upsert({
                              plugin_key: plugin.key,
                              enabled: !activePlugins.includes(plugin.key)
                            });

                          if (error) throw error;
                          
                          await refreshPlugins();
                          toast.success(`${plugin.name} ${activePlugins.includes(plugin.key) ? 'disabled' : 'enabled'}`);
                        } catch (error) {
                          console.error('Error toggling plugin:', error);
                          toast.error("Failed to update plugin status");
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          {selectedPlugin && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Plugin Configuration</h2>
              </CardHeader>
              <CardContent>
                <PluginConfigEditor
                  pluginKey={selectedPlugin}
                  onSave={handleSaveConfig}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
