
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

type PluginWithCertification = {
  id: string;
  name: string;
  version: string;
  installs: number;
  certification?: {
    certification_level: string;
  };
};

export default function PluginLeaderboard() {
  const [plugins, setPlugins] = useState<PluginWithCertification[]>([]);

  useEffect(() => {
    async function fetchPlugins() {
      const { data, error } = await supabase
        .from("plugins")
        .select(`
          id, 
          name, 
          version, 
          plugin_certifications(certification_level)
        `)
        .order('version', { ascending: false });

      if (error) {
        console.error("Error fetching plugins:", error);
        return;
      }

      // Transform data to match our type
      const processedPlugins = data.map(plugin => ({
        id: plugin.id,
        name: plugin.name,
        version: plugin.version,
        installs: 0, // TODO: Add actual install count logic
        certification: plugin.plugin_certifications?.[0]
      }));

      setPlugins(processedPlugins);
    }

    fetchPlugins();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>🌌 Plugin Galaxy Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plugins.map((plugin, index) => (
              <div 
                key={plugin.id} 
                className="flex justify-between items-center border rounded p-4"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">#{index + 1}</span>
                    <span>{plugin.name}</h2>
                    {plugin.certification && (
                      <Badge variant="secondary">
                        {plugin.certification.certification_level} Certified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Version: {plugin.version}
                  </p>
                </div>
                <span className="font-semibold">
                  {plugin.installs} installs
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
