
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PluginSubmitPage() {
  const { tenant } = useTenant();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [form, setForm] = useState({
    plugin_name: "",
    description: "",
    zip_url: "",
    schema_sql: "",
    install_script: "",
    license_type: "free",
    price_usd: ""
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

    setIsSubmitting(true);

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
        install_script: "",
        license_type: "free",
        price_usd: ""
      });
    } catch (error) {
      toast.error("Failed to submit plugin", {
        description: (error as Error).message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const trySandbox = async () => {
    if (!tenant?.id) {
      toast.error("No tenant selected");
      return;
    }

    if (!form.schema_sql) {
      toast.error("No SQL schema provided to test");
      return;
    }

    setIsTesting(true);

    try {
      const response = await supabase.functions.invoke('sandbox-install', {
        body: JSON.stringify({
          tenant_id: tenant.id,
          schema_sql: form.schema_sql
        })
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data;
      
      if (data.success) {
        toast.success("Schema tested successfully in sandbox", {
          description: "Your database schema looks good and can be installed safely."
        });
      } else {
        toast.error("Schema test failed", {
          description: data.message || "There was an error testing your schema."
        });
      }
    } catch (error) {
      toast.error("Failed to test in sandbox", {
        description: (error as Error).message
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">🚀 Submit a Plugin</h1>
      
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="technical">Technical Details</TabsTrigger>
          <TabsTrigger value="licensing">Licensing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <div>
            <label htmlFor="plugin-name" className="block mb-2 text-sm font-medium">
              Plugin Name *
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
              Description *
            </label>
            <Textarea 
              id="description"
              placeholder="Describe what your plugin does" 
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className="min-h-32"
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
            <p className="text-xs text-muted-foreground mt-1">
              Link to a ZIP file containing your plugin source code
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="technical" className="space-y-4">
          <div>
            <label htmlFor="schema-sql" className="block mb-2 text-sm font-medium">
              Schema SQL
            </label>
            <Textarea 
              id="schema-sql"
              placeholder="SQL for any database tables your plugin needs" 
              value={form.schema_sql}
              onChange={(e) => setForm(f => ({ ...f, schema_sql: e.target.value }))}
              className="font-mono text-sm min-h-64"
            />
            <div className="mt-2">
              <Button 
                onClick={trySandbox} 
                variant="outline" 
                size="sm"
                disabled={isTesting || !form.schema_sql}
              >
                {isTesting ? "Testing..." : "Test in Sandbox"}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Test your SQL schema in an isolated environment (dev mode only)
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="install-script" className="block mb-2 text-sm font-medium">
              Install Script
            </label>
            <Textarea 
              id="install-script"
              placeholder="Any additional installation logic" 
              value={form.install_script}
              onChange={(e) => setForm(f => ({ ...f, install_script: e.target.value }))}
              className="font-mono text-sm min-h-32"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="licensing" className="space-y-4">
          <div>
            <label htmlFor="license-type" className="block mb-2 text-sm font-medium">
              License Type
            </label>
            <Select 
              value={form.license_type} 
              onValueChange={(value) => setForm(f => ({ ...f, license_type: value }))}
            >
              <SelectTrigger id="license-type">
                <SelectValue placeholder="Select a license type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="proprietary">Paid</SelectItem>
                <SelectItem value="nft">NFT-License</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {form.license_type === "proprietary" && (
            <div>
              <label htmlFor="price" className="block mb-2 text-sm font-medium">
                Price (USD)
              </label>
              <Input
                id="price"
                type="number"
                placeholder="29.99"
                value={form.price_usd}
                onChange={(e) => setForm(f => ({ ...f, price_usd: e.target.value }))}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Button 
          onClick={handleSubmit} 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Plugin"}
        </Button>
      </div>
    </div>
  );
}
