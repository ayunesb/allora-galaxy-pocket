
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";

export default function GalaxyCreatePage() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [plugin, setPlugin] = useState({ 
    plugin_name: "", 
    description: "", 
    zip_url: "", 
    schema_sql: "", 
    install_script: "",
    category: "Utilities"
  });

  const submit = async () => {
    if (!user || !tenant) {
      toast.error("Authentication Required", {
        description: "Please log in to submit a plugin to the Galaxy."
      });
      return;
    }

    if (!plugin.plugin_name || !plugin.description) {
      toast.error("Missing Required Fields", {
        description: "Please fill out all required fields."
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { error } = await supabase.from("plugin_submissions").insert({ 
        tenant_id: tenant.id,
        plugin_name: plugin.plugin_name,
        description: plugin.description,
        zip_url: plugin.zip_url,
        schema_sql: plugin.schema_sql,
        install_script: plugin.install_script,
        category: plugin.category,
        status: 'pending'
      });

      if (error) throw error;

      toast.success("Plugin Submitted", {
        description: "Your plugin has been submitted to the Galaxy and is pending review."
      });
      
      // Reset form
      setPlugin({ 
        plugin_name: "", 
        description: "", 
        zip_url: "", 
        schema_sql: "", 
        install_script: "",
        category: "Utilities"
      });
    } catch (error) {
      toast.error("Submission Failed", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🌌</span>
              <span>Publish to Galaxy</span>
            </CardTitle>
            <CardDescription>
              Submit your plugin to Allora OS Galaxy for review. Once approved, your plugin will be available to all users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Plugin Name</label>
                <Input
                  placeholder="Enter a descriptive name"
                  value={plugin.plugin_name}
                  onChange={(e) => setPlugin(p => ({ ...p, plugin_name: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Textarea
                  placeholder="Describe what your plugin does"
                  className="min-h-24"
                  value={plugin.description}
                  onChange={(e) => setPlugin(p => ({ ...p, description: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">ZIP URL (Optional)</label>
                <Input
                  placeholder="Link to your plugin's ZIP file"
                  value={plugin.zip_url}
                  onChange={(e) => setPlugin(p => ({ ...p, zip_url: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  If your plugin has assets or code, provide a link to a ZIP file
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Schema SQL</label>
                <Textarea
                  placeholder="Database schema for your plugin"
                  className="min-h-32 font-mono"
                  value={plugin.schema_sql}
                  onChange={(e) => setPlugin(p => ({ ...p, schema_sql: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Install Script (Optional)</label>
                <Textarea
                  placeholder="Installation script for your plugin"
                  className="min-h-32 font-mono"
                  value={plugin.install_script}
                  onChange={(e) => setPlugin(p => ({ ...p, install_script: e.target.value }))}
                />
              </div>

              <Button 
                onClick={submit} 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Submitting..." : "Submit to Galaxy"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
