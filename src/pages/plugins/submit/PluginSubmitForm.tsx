
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SandboxButton } from "./SandboxButton";
import { usePluginSubmitForm } from "./usePluginSubmitForm";

export default function PluginSubmitForm() {
  const {
    form,
    handleChange,
    handleSubmit,
    isSubmitting,
  } = usePluginSubmitForm();

  return (
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
            onChange={(e) => handleChange("plugin_name", e.target.value)}
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
            onChange={(e) => handleChange("description", e.target.value)}
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
            onChange={(e) => handleChange("zip_url", e.target.value)}
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
            onChange={(e) => handleChange("schema_sql", e.target.value)}
            className="font-mono text-sm min-h-64"
          />
          <div className="mt-2">
            <SandboxButton schema_sql={form.schema_sql} disabled={!form.schema_sql} />
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
            onChange={(e) => handleChange("install_script", e.target.value)}
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
            onValueChange={(value) => handleChange("license_type", value as any)}
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
              onChange={(e) => handleChange("price_usd", e.target.value)}
            />
          </div>
        )}
      </TabsContent>
      <div className="mt-6">
        <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Plugin"}
        </Button>
      </div>
    </Tabs>
  );
}
