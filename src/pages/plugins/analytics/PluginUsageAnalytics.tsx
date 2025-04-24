
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { Download, TrendingUp, Activity, Database } from "lucide-react";
import { usePlugins } from "@/hooks/usePlugins";

interface PluginUsage {
  plugin_key: string;
  total_events: number;
  event_breakdown: { [key: string]: number };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function PluginUsageAnalytics() {
  const { tenant } = useTenant();
  const { activePlugins } = usePlugins();
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days'>('30days');
  const [pluginUsage, setPluginUsage] = useState<PluginUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalEvents, setTotalEvents] = useState(0);
  
  useEffect(() => {
    const fetchUsageData = async () => {
      if (!tenant?.id) return;
      
      setIsLoading(true);
      try {
        let dateFilter = 'now() - interval \'30 days\'';
        if (timeRange === '7days') dateFilter = 'now() - interval \'7 days\'';
        if (timeRange === '90days') dateFilter = 'now() - interval \'90 days\'';
        
        const { data, error } = await supabase
          .from('plugin_usage_logs')
          .select('plugin_key, event, count')
          .eq('tenant_id', tenant.id)
          .gte('created_at', dateFilter)
          .order('plugin_key', { ascending: true });
        
        if (error) throw error;
        
        // Aggregate data by plugin
        const pluginMap: Record<string, PluginUsage> = {};
        let total = 0;
        
        data.forEach(log => {
          if (!pluginMap[log.plugin_key]) {
            pluginMap[log.plugin_key] = {
              plugin_key: log.plugin_key,
              total_events: 0,
              event_breakdown: {}
            };
          }
          
          pluginMap[log.plugin_key].total_events += log.count;
          if (!pluginMap[log.plugin_key].event_breakdown[log.event]) {
            pluginMap[log.plugin_key].event_breakdown[log.event] = 0;
          }
          pluginMap[log.plugin_key].event_breakdown[log.event] += log.count;
          total += log.count;
        });
        
        setPluginUsage(Object.values(pluginMap));
        setTotalEvents(total);
      } catch (error) {
        console.error("Error fetching plugin usage:", error);
        toast.error("Failed to load plugin usage data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsageData();
  }, [tenant?.id, timeRange]);

  // Format data for the overall plugin usage chart
  const pluginDistributionData = pluginUsage.map((item, index) => ({
    name: item.plugin_key,
    value: item.total_events,
    color: COLORS[index % COLORS.length]
  }));
  
  // Top events across all plugins
  const getTopEvents = () => {
    const allEvents: Record<string, number> = {};
    
    pluginUsage.forEach(plugin => {
      Object.entries(plugin.event_breakdown).forEach(([event, count]) => {
        if (!allEvents[event]) allEvents[event] = 0;
        allEvents[event] += count;
      });
    });
    
    return Object.entries(allEvents)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Plugin Usage Analytics</h1>
        <p className="text-muted-foreground">Monitor and analyze how plugins are being used in your workspace</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Plugins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePlugins.length}</div>
            <p className="text-xs text-muted-foreground">
              Out of {pluginUsage.length} installed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              In the last {timeRange === '7days' ? '7 days' : timeRange === '30days' ? '30 days' : '90 days'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Active Plugin</CardTitle>
          </CardHeader>
          <CardContent>
            {pluginUsage.length > 0 ? (
              <>
                <div className="text-2xl font-bold">
                  {[...pluginUsage].sort((a, b) => b.total_events - a.total_events)[0]?.plugin_key || "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {[...pluginUsage].sort((a, b) => b.total_events - a.total_events)[0]?.total_events || 0} events
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">N/A</div>
                <p className="text-xs text-muted-foreground">No plugin activity recorded</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="30days" value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="7days">Last 7 Days</TabsTrigger>
            <TabsTrigger value="30days">Last 30 Days</TabsTrigger>
            <TabsTrigger value="90days">Last 90 Days</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={timeRange} className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : pluginUsage.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No plugin usage data available</h3>
                <p className="text-muted-foreground">Start using plugins to see analytics data</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Plugin usage distribution chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Plugin Usage Distribution</CardTitle>
                  <CardDescription>Overall usage across plugins</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pluginDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pluginDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top events chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Events</CardTitle>
                  <CardDescription>Most frequent plugin events</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getTopEvents()}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Event Count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Individual plugin breakdowns */}
              {pluginUsage.map(plugin => (
                <Card key={plugin.plugin_key}>
                  <CardHeader>
                    <CardTitle>{plugin.plugin_key}</CardTitle>
                    <CardDescription>{plugin.total_events} total events</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(plugin.event_breakdown).map(([name, value]) => ({ name, value }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" name="Count" fill="#0088FE" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
