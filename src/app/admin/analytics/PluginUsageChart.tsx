
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PluginUsageChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['plugin-usage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plugin_usage_logs')
        .select('plugin_key, count');

      if (error) throw error;

      // Group by plugin_key and sum counts
      const groupedData = data.reduce((acc, log) => {
        acc[log.plugin_key] = (acc[log.plugin_key] || 0) + log.count;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(groupedData).map(([name, value]) => ({
        name,
        value
      }));
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plugin Usage</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          Loading usage data...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plugin Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
