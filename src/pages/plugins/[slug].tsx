
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  changelog?: string;
  slug: string;
}

export default function PluginProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const [plugin, setPlugin] = useState<Plugin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPluginDetails() {
      try {
        const { data, error } = await supabase
          .from('plugins')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setPlugin(data);
      } catch (error) {
        toast.error("Failed to load plugin details", {
          description: error instanceof Error ? error.message : "Unknown error"
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchPluginDetails();
  }, [slug]);

  const handleInstall = () => {
    toast.info("Plugin Installation", {
      description: `Preparing to install ${plugin?.name}`
    });
    // TODO: Implement actual plugin installation logic
  };

  if (isLoading) {
    return <div className="p-6">Loading plugin details...</div>;
  }

  if (!plugin) {
    return <div className="p-6">Plugin not found</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>{plugin.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{plugin.description}</p>
          <div className="space-y-2">
            <p>Version: {plugin.version}</p>
            {plugin.changelog && (
              <div>
                <h3 className="font-semibold">Changelog</h3>
                <pre className="text-sm bg-muted p-2 rounded">{plugin.changelog}</pre>
              </div>
            )}
          </div>
          <Button 
            onClick={handleInstall} 
            className="mt-4"
          >
            Install Plugin
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
