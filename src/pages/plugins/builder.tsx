
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { useTenant } from "@/hooks/useTenant";

export default function PluginBuilder() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { canManagePlugins } = useRolePermissions();
  const [form, setForm] = useState({
    plugin_name: "",
    description: "",
    category: "",
    components: [] as string[],
    schema_sql: "",
    install_script: ""
  });

  const addComponent = (component: string) =>
    setForm(f => ({ ...f, components: [...f.components, component] }));

  const savePlugin = async () => {
    if (!user || !tenant || !canManagePlugins) {
      toast.error("Unauthorized", {
        description: "You do not have permission to create plugins"
      });
      return;
    }

    try {
      const { error } = await supabase.from("plugin_submissions").insert({
        tenant_id: tenant.id,
        plugin_name: form.plugin_name,
        description: form.description,
        category: form.category,
        schema_sql: form.schema_sql,
        install_script: form.install_script,
        status: 'pending'
      });

      if (error) throw error;

      toast.success("Plugin Submitted", {
        description: "Your plugin is now under review"
      });
      
      // Reset form
      setForm({
        plugin_name: "",
        description: "",
        category: "",
        components: [],
        schema_sql: "",
        install_script: ""
      });
    } catch (error) {
      toast.error("Submission Failed", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  if (!canManagePlugins) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">🚫 Access Denied</h1>
        <p>You do not have permission to create plugins.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>🧱 Plugin Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input 
              placeholder="Plugin Name" 
              value={form.plugin_name}
              onChange={(e) => setForm(f => ({ ...f, plugin_name: e.target.value }))}
            />
            <textarea 
              placeholder="Description" 
              className="w-full border rounded p-2"
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <Select 
              value={form.category}
              onValueChange={(value) => setForm(f => ({ ...f, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Analytics">Analytics</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
              </SelectContent>
            </Select>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Add Components</h3>
              <div className="flex gap-2">
                {['Form', 'Table', 'Chart'].map(component => (
                  <Button 
                    key={component} 
                    variant="secondary" 
                    onClick={() => addComponent(component)}
                  >
                    {component}
                  </Button>
                ))}
              </div>
              {form.components.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {form.components.join(", ")}
                </p>
              )}
            </div>

            <textarea 
              placeholder="Schema SQL" 
              className="w-full border rounded p-2 h-28"
              value={form.schema_sql}
              onChange={(e) => setForm(f => ({ ...f, schema_sql: e.target.value }))}
            />
            <textarea 
              placeholder="Install Script (optional)" 
              className="w-full border rounded p-2 h-24"
              value={form.install_script}
              onChange={(e) => setForm(f => ({ ...f, install_script: e.target.value }))}
            />

            <Button onClick={savePlugin} className="w-full">
              Submit Plugin for Review
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
