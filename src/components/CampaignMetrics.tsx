
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';

interface CampaignMetricsProps {
  campaignId: string;
  detailed?: boolean;
}

export const CampaignMetrics: React.FC<CampaignMetricsProps> = ({ campaignId, detailed = false }) => {
  const { tenant } = useTenant();
  
  const { data: campaign, isLoading, error } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      if (!tenant?.id) throw new Error("No tenant selected");
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id)
        .single();
        
      if (error) throw error;
      
      return data || null;
    },
    enabled: !!campaignId && !!tenant?.id,
  });
  
  // Transform campaign execution metrics to chart format
  const getChartData = () => {
    if (!campaign || !campaign.execution_metrics) return [];
    
    // Safely access execution_metrics with type checking
    const metrics = campaign.execution_metrics;
    
    // Check if metrics is an object and has a history array
    if (typeof metrics === 'object' && metrics !== null && 'history' in metrics && Array.isArray(metrics.history)) {
      return metrics.history.map((item: any) => ({
        date: new Date(item.date || item.timestamp || Date.now()).toLocaleDateString(),
        views: item.views || 0,
        clicks: item.clicks || 0,
        conversions: item.conversions || 0,
      }));
    }
    
    // Otherwise, just create a single data point
    return [{
      date: new Date().toLocaleDateString(),
      views: typeof metrics === 'object' && metrics !== null && 'views' in metrics ? Number(metrics.views) || 0 : 0,
      clicks: typeof metrics === 'object' && metrics !== null && 'clicks' in metrics ? Number(metrics.clicks) || 0 : 0,
      conversions: typeof metrics === 'object' && metrics !== null && 'conversions' in metrics ? Number(metrics.conversions) || 0 : 0,
    }];
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-48">
          <p className="text-muted-foreground">Loading metrics...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (error || !campaign) {
    return (
      <Card>
        <CardContent className="flex flex-col justify-center items-center h-48">
          <p className="text-muted-foreground">No metrics available for this campaign.</p>
          {error && <p className="text-sm text-red-500 mt-2">{error.toString()}</p>}
        </CardContent>
      </Card>
    );
  }
  
  // Get metrics from campaign execution_metrics
  const metrics = campaign.execution_metrics || {};
  const chartData = getChartData();
  
  // Helper function to safely extract numeric values
  const safeGetMetricValue = (metricName: string): number => {
    if (typeof metrics !== 'object' || metrics === null) return 0;
    if (!(metricName in metrics)) return 0;
    const value = metrics[metricName as keyof typeof metrics];
    return typeof value === 'number' ? value : 0;
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#8884d8" name="Views" />
                <Bar dataKey="clicks" fill="#82ca9d" name="Clicks" />
                <Bar dataKey="conversions" fill="#ffc658" name="Conversions" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-48">
              <p className="text-muted-foreground">No metric history available.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {detailed && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {safeGetMetricValue('views')}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Total Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {safeGetMetricValue('clicks')}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Total Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {safeGetMetricValue('conversions')}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
