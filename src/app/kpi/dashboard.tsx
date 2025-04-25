
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { ToastService } from "@/services/ToastService";
import { 
  AlertCircle, 
  ArrowLeft, 
  BarChart as BarChartIcon, 
  TrendingUp, 
  LineChart as LineChartIcon,
  Plus
} from "lucide-react";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

export default function KpiDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const { logActivity } = useSystemLogs();
  
  const campaignId = location.state?.campaignId;
  const campaignName = location.state?.campaignName;
  const returnPath = location.state?.returnPath || "/campaigns";
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpiMetrics, setKpiMetrics] = useState<any[]>([]);
  const [kpiTrends, setKpiTrends] = useState<any[]>([]);
  const [campaign, setCampaign] = useState<any>(null);
  const [metricKeys, setMetricKeys] = useState<string[]>([]);
  
  useEffect(() => {
    if (!tenant?.id) return;
    
    const fetchKpiData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Log that user accessed KPI dashboard
        await logActivity({
          event_type: "KPI_DASHBOARD_ACCESS",
          message: campaignId 
            ? `KPI dashboard accessed for campaign ${campaignName || campaignId}`
            : "Main KPI dashboard accessed",
          meta: campaignId ? { campaign_id: campaignId } : {}
        });
        
        // Fetch current KPI metrics
        const { data: metricsData, error: metricsError } = await supabase
          .from('kpi_metrics')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false });
          
        if (metricsError) throw metricsError;
        
        setKpiMetrics(metricsData || []);
        
        // Extract unique metric keys
        const keys = Array.from(new Set(metricsData?.map(m => m.metric) || []));
        setMetricKeys(keys);
        
        // Fetch historical KPI data for trends
        const { data: trendsData, error: trendsError } = await supabase
          .from('kpi_metrics_history')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('recorded_at', { ascending: true });
          
        if (trendsError) throw trendsError;
        
        setKpiTrends(trendsData || []);
        
        // If we have a campaignId, fetch the campaign details
        if (campaignId) {
          const { data: campaignData, error: campaignError } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', campaignId)
            .single();
            
          if (campaignError && campaignError.code !== 'PGRST116') {
            console.error("Error fetching campaign:", campaignError);
          } else {
            setCampaign(campaignData);
          }
        }
      } catch (err: any) {
        console.error("Error fetching KPI data:", err);
        setError(err.message || "Failed to load KPI data");
        ToastService.error({
          title: "Error loading KPI data",
          description: err.message || "Please try again"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchKpiData();
  }, [tenant?.id, campaignId, campaignName]);
  
  // Transform metrics data for visualization
  const prepareChartData = () => {
    const chartData: any[] = [];
    
    // Group metrics by date
    const metricsByDate = kpiMetrics.reduce((acc, metric) => {
      const date = new Date(metric.created_at).toLocaleDateString();
      
      if (!acc[date]) acc[date] = {};
      
      acc[date][metric.metric] = metric.value;
      acc[date].date = date;
      
      return acc;
    }, {});
    
    // Convert to array for chart
    Object.values(metricsByDate).forEach(dateMetrics => {
      chartData.push(dateMetrics);
    });
    
    // Sort by date
    chartData.sort((a: any, b: any) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    return chartData;
  };
  
  const chartData = prepareChartData();

  if (loading) {
    return <LoadingOverlay show={true} label="Loading KPI data..." />;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(returnPath)}
            className="flex items-center gap-1 mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">KPI Dashboard</h1>
            <p className="text-muted-foreground">
              {campaign ? `Metrics for campaign: ${campaign.name}` : 'Overview of all key performance indicators'}
            </p>
          </div>
        </div>
        
        <Button
          onClick={() => navigate("/kpi/add")}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Metric
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {kpiMetrics.length === 0 ? (
        <Card className="bg-muted/40">
          <CardContent className="flex flex-col items-center justify-center p-10 text-center">
            <BarChartIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium">No KPI data yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start tracking your key performance indicators to measure the impact of your campaigns
            </p>
            <Button onClick={() => navigate("/kpi/add")} className="flex gap-2 items-center">
              <Plus className="h-4 w-4" /> Add First Metric
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            {campaign && <TabsTrigger value="campaign">Campaign Impact</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from(new Set(kpiMetrics.map(m => m.metric))).map(metric => {
                // Find the most recent value for this metric
                const latestMetric = kpiMetrics
                  .filter(m => m.metric === metric)
                  .sort((a, b) => {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                  })[0];
                
                // Find the previous value for comparison
                const previousMetrics = kpiMetrics
                  .filter(m => m.metric === metric)
                  .sort((a, b) => {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                  });
                
                const previousMetric = previousMetrics.length > 1 ? previousMetrics[1] : null;
                const percentChange = previousMetric 
                  ? ((latestMetric.value - previousMetric.value) / previousMetric.value * 100).toFixed(1)
                  : null;
                
                return (
                  <Card key={metric} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{metric}</CardTitle>
                      <CardDescription>
                        {new Date(latestMetric.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-3xl font-semibold">{latestMetric.value}</p>
                        </div>
                        
                        {percentChange !== null && (
                          <div className={`flex items-center text-sm ${
                            Number(percentChange) > 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : Number(percentChange) < 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-muted-foreground'
                          }`}>
                            {Number(percentChange) > 0 && '+'}{percentChange}%
                            <TrendingUp className={`h-4 w-4 ml-1 ${
                              Number(percentChange) < 0 ? 'rotate-180' : ''
                            }`} />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5" /> Performance Overview
                </CardTitle>
                <CardDescription>
                  Combined view of all key metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      {metricKeys.map((key, index) => (
                        <Line
                          key={key}
                          type="monotone"
                          dataKey={key}
                          stroke={`hsl(${index * (360 / metricKeys.length)}, 70%, 50%)`}
                          activeDot={{ r: 6 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-6 pt-2">
            {metricKeys.map((metric, index) => (
              <Card key={metric}>
                <CardHeader>
                  <CardTitle className="text-lg">{metric} Trend</CardTitle>
                  <CardDescription>
                    Historical performance data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={chartData.filter(d => d[metric] !== undefined)}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar 
                          dataKey={metric}
                          fill={`hsl(${index * (360 / metricKeys.length)}, 70%, 50%)`}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          {campaign && (
            <TabsContent value="campaign" className="space-y-6 pt-2">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Impact</CardTitle>
                  <CardDescription>
                    Metrics related to campaign: {campaign.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Display campaign-specific metrics */}
                    {campaign.metrics && Object.keys(campaign.metrics).length > 0 ? (
                      Object.entries(campaign.metrics).map(([key, value]: [string, any]) => (
                        <Card key={key} className="bg-muted/30">
                          <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground mb-1">{key}</p>
                            <p className="text-2xl font-semibold">{value}</p>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-4 text-muted-foreground">
                        No campaign-specific metrics available yet
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4">Impact on Key Metrics</h3>
                    
                    {/* Show metrics before/after campaign start */}
                    {campaign.execution_start_date && (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            <XAxis 
                              dataKey="date" 
                              // Mark campaign start date
                              ticks={[
                                ...chartData.map(d => d.date),
                                new Date(campaign.execution_start_date).toLocaleDateString()
                              ]}
                            />
                            <YAxis />
                            <Tooltip />
                            {/* Draw a vertical line at campaign start */}
                            {/* Render each metric line */}
                            {metricKeys.map((key, index) => (
                              <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={`hsl(${index * (360 / metricKeys.length)}, 70%, 50%)`}
                                activeDot={{ r: 6 }}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      )}
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => navigate(returnPath)}>
          Back
        </Button>
        <Button 
          onClick={() => {
            // Log KPI review completion
            logActivity({
              event_type: "KPI_REVIEW_COMPLETED",
              message: campaignId 
                ? `KPI review completed for campaign ${campaignName || campaignId}`
                : "KPI dashboard review completed",
              meta: campaignId ? { campaign_id: campaignId } : {}
            }).catch(err => console.error("Failed to log KPI review:", err));
            
            // Navigate back
            navigate(returnPath);
          }}
        >
          Complete Review
        </Button>
      </div>
    </div>
  );
}
