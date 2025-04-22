
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";

export default function PluginSubmitPage() {
  const { tenant } = useTenant();
  const [form, setForm] = useState({
    plugin_name: "",
    description: "",
    zip_url: "",
    schema_sql: "",
    install_script: ""
  });

  const handleSubmit = async () => {
    // Validate inputs
    if (!form.plugin_name || !form.description) {
      toast.error("Please fill in the required fields");
      return;
    }

    if (!tenant?.id) {
      toast.error("No tenant selected");
      return;
    }

    try {
      const { error } = await supabase.from("plugin_submissions").insert({
        ...form,
        tenant_id: tenant.id
      });

      if (error) throw error;

      toast.success("Plugin submitted for review 🚀", {
        description: "Our team will review your plugin submission soon."
      });

      // Reset form
      setForm({
        plugin_name: "",
        description: "",
        zip_url: "",
        schema_sql: "",
        install_script: ""
      });
    } catch (error) {
      toast.error("Failed to submit plugin", {
        description: (error as Error).message
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">🚀 Submit a Plugin</h1>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="plugin-name" className="block mb-2 text-sm font-medium">
            Plugin Name
          </label>
          <Input 
            id="plugin-name"
            placeholder="Enter plugin name" 
            value={form.plugin_name}
            onChange={(e) => setForm(f => ({ ...f, plugin_name: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="description" className="block mb-2 text-sm font-medium">
            Description
          </label>
          <Textarea 
            id="description"
            placeholder="Describe what your plugin does" 
            value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="zip-url" className="block mb-2 text-sm font-medium">
            ZIP URL
          </label>
          <Input 
            id="zip-url"
            placeholder="URL to plugin ZIP file" 
            value={form.zip_url}
            onChange={(e) => setForm(f => ({ ...f, zip_url: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="schema-sql" className="block mb-2 text-sm font-medium">
            Schema SQL (Optional)
          </label>
          <Textarea 
            id="schema-sql"
            placeholder="SQL for any database tables your plugin needs" 
            value={form.schema_sql}
            onChange={(e) => setForm(f => ({ ...f, schema_sql: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="install-script" className="block mb-2 text-sm font-medium">
            Install Script (Optional)
          </label>
          <Textarea 
            id="install-script"
            placeholder="Any additional installation logic" 
            value={form.install_script}
            onChange={(e) => setForm(f => ({ ...f, install_script: e.target.value }))}
          />
        </div>

        <Button onClick={handleSubmit} className="w-full">
          Submit Plugin
        </Button>
      </div>
    </div>
  );
}
