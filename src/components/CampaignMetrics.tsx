
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
  
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['campaign-metrics', campaignId],
    queryFn: async () => {
      if (!tenant?.id) throw new Error("No tenant selected");
      
      const { data, error } = await supabase
        .from('campaign_metrics')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('tenant_id', tenant.id)
        .order('recorded_at', { ascending: true });
        
      if (error) throw error;
      
      return data || [];
    },
    enabled: !!campaignId && !!tenant?.id,
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-48">
          <p className="text-muted-foreground">Loading metrics...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (error || !metrics || metrics.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col justify-center items-center h-48">
          <p className="text-muted-foreground">No metrics available for this campaign.</p>
          {error && <p className="text-sm text-red-500 mt-2">{error.toString()}</p>}
        </CardContent>
      </Card>
    );
  }
  
  // Transform data for chart display
  const chartData = metrics.map(metric => ({
    date: new Date(metric.recorded_at).toLocaleDateString(),
    views: metric.views || 0,
    clicks: metric.clicks || 0,
    conversions: metric.conversions || 0,
  }));
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
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
                {metrics.reduce((sum, metric) => sum + (metric.views || 0), 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Total Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {metrics.reduce((sum, metric) => sum + (metric.clicks || 0), 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Total Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {metrics.reduce((sum, metric) => sum + (metric.conversions || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
