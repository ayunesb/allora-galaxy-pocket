
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface PluginUsageLog {
  plugin_key: string;
  page: string;
  count: number;
}

export function PluginAnalytics() {
  const [usageLogs, setUsageLogs] = useState<PluginUsageLog[]>([]);

  useEffect(() => {
    async function fetchPluginUsageLogs() {
      const { data, error } = await supabase
        .from('plugin_usage_logs')
        .select('plugin_key, page, count')
        .order('count', { ascending: false });

      if (error) {
        console.error('Error fetching plugin usage:', error);
        return;
      }

      // Group and aggregate logs
      const aggregatedLogs = data.reduce((acc, log) => {
        const key = `${log.plugin_key} - ${log.page}`;
        const existingLog = acc.find(item => item.name === key);
        
        if (existingLog) {
          existingLog.value += log.count;
        } else {
          acc.push({ name: key, value: log.count });
        }
        
        return acc;
      }, [] as { name: string; value: number }[]);

      setUsageLogs(aggregatedLogs);
    }

    fetchPluginUsageLogs();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Plugin Usage Analytics</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={usageLogs}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
