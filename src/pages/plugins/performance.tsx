
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";

type Plugin = {
  id: string;
  name: string;
  installs: number;
  remix_count: number;
  revenue_generated?: number;
  earnings?: number;
};

export default function PluginPerformance() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlugins() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("plugins")
          .select("id, name, installs, remix_count")
          .order('installs', { ascending: false });

        if (error) {
          console.error("Error fetching plugins:", error);
          return;
        }

        // Transform data and add placeholder revenue/earnings data
        // In a real implementation, this would come from the database
        const pluginsWithRevenue = (data || []).map(plugin => ({
          ...plugin,
          revenue_generated: Math.floor(Math.random() * 10000), // Placeholder
          earnings: Math.floor(Math.random() * 1000), // Placeholder
        }));

        setPlugins(pluginsWithRevenue);
      } finally {
        setLoading(false);
      }
    }

    fetchPlugins();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Plugin Performance Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plugin Name</TableHead>
                  <TableHead>Installs</TableHead>
                  <TableHead>Revenue Generated</TableHead>
                  <TableHead>Creator Earnings</TableHead>
                  <TableHead>Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plugins.map((plugin) => (
                  <TableRow key={plugin.id}>
                    <TableCell className="font-medium">{plugin.name}</TableCell>
                    <TableCell>{plugin.installs.toLocaleString()}</TableCell>
                    <TableCell>${plugin.revenue_generated?.toLocaleString() || "0"}</TableCell>
                    <TableCell className="text-green-600">
                      ${plugin.earnings?.toLocaleString() || "0"}
                    </TableCell>
                    <TableCell>
                      {(plugin.revenue_generated || 0) > 5000 ? (
                        <Badge variant="success" className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" /> High Impact
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <TrendingDown className="h-4 w-4" /> Growing
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
