
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorAlert from '@/components/ui/ErrorAlert';

interface HealthMetric {
  timestamp: string;
  value: number;
}

interface AgentHealthMonitorProps {
  agentName: string;
}

export default function AgentHealthMonitor({ agentName }: AgentHealthMonitorProps) {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchHealthMetrics() {
      if (!agentName) {
        setMetrics([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // Fetch agent performance metrics
        const { data, error } = await supabase
          .from('agent_performance_logs')
          .select('created_at, metrics')
          .eq('agent_name', agentName)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        // Transform data for charting
        const transformedData = data.map(item => ({
          timestamp: new Date(item.created_at).toLocaleDateString(),
          value: item.metrics?.health_score || 0
        }));
        
        setMetrics(transformedData);
      } catch (err) {
        console.error("Error fetching agent health metrics:", err);
        setError(err instanceof Error ? err : new Error('Failed to fetch agent health metrics'));
      } finally {
        setLoading(false);
      }
    }
    
    fetchHealthMetrics();
  }, [agentName]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner size="lg" label="Loading agent health metrics..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <ErrorAlert 
        title="Failed to load agent health metrics" 
        description={error.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (metrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agent Health</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No health metrics available for this agent yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const latestValue = metrics[metrics.length - 1]?.value || 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Health Monitor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <span className="text-2xl font-bold">{latestValue}</span>
          <span className="text-muted-foreground ml-2">Health Score</span>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics}>
              <XAxis dataKey="timestamp" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="border rounded p-3">
            <p className="text-sm font-medium">Memory Score</p>
            <p className="text-xl">{metrics[metrics.length - 1]?.value || 0}%</p>
          </div>
          <div className="border rounded p-3">
            <p className="text-sm font-medium">Execution Rate</p>
            <p className="text-xl">100%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
