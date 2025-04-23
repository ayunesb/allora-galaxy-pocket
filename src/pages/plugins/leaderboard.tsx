
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, New, Repeat } from "lucide-react";

type PluginWithCertification = {
  id: string;
  name: string;
  version: string;
  installs: number;
  remix_count?: number;
  created_at?: string;
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
          created_at,
          installs,
          remix_count,
          plugin_certifications(certification_level)
        `)
        .order('installs', { ascending: false });

      if (error) {
        console.error("Error fetching plugins:", error);
        return;
      }

      // Transform data to match our type and fill fallback for remix_count
      const processedPlugins = (data || []).map(plugin => ({
        id: plugin.id,
        name: plugin.name,
        version: plugin.version,
        created_at: plugin.created_at,
        installs: plugin.installs ?? 0,
        remix_count: plugin.remix_count ?? 0,
        certification: plugin.plugin_certifications?.[0]
      }));

      setPlugins(processedPlugins);
    }

    fetchPlugins();
  }, []);

  // Badge logic
  // Top 3 most installed (by sorted installs desc)
  const top3Ids = plugins
    .sort((a, b) => b.installs - a.installs)
    .slice(0, 3)
    .map(p => p.id);

  const now = Date.now();

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>🌌 Plugin Galaxy Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plugins.map((plugin, index) => {
              const isMostInstalled = top3Ids.includes(plugin.id);
              const isNew = plugin.created_at && (now - new Date(plugin.created_at).getTime() < 7 * 86400000);
              const isRemixed = (plugin.remix_count ?? 0) >= 3;

              return (
                <div 
                  key={plugin.id} 
                  className="flex justify-between items-center border rounded p-4"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">#{index + 1}</span>
                      <span>{plugin.name}</span>
                      {plugin.certification && (
                        <Badge variant="secondary">
                          {plugin.certification.certification_level} Certified
                        </Badge>
                      )}
                      {isMostInstalled && (
                        <Badge variant="warning" className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-yellow-600" /> Most Installed
                        </Badge>
                      )}
                      {isNew && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <New className="w-4 h-4 text-blue-500" /> New
                        </Badge>
                      )}
                      {isRemixed && (
                        <Badge variant="success" className="flex items-center gap-1">
                          <Repeat className="w-4 h-4 text-green-600" /> Remixed
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Version: {plugin.version}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-semibold">
                      {plugin.installs} installs
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {typeof plugin.remix_count === "number" ? `${plugin.remix_count} remixes` : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
