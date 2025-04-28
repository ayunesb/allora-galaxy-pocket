
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AgentHealthMonitorProps {
  agentName: string;
}

interface HealthData {
  health_score: number;
  alertCount: number;
  last_check: string;
  status: 'healthy' | 'warning' | 'critical';
}

export default function AgentHealthMonitor({ agentName }: AgentHealthMonitorProps) {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchHealthData = async () => {
      if (!agentName) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Get agent health metrics
        const { data: agentData, error: agentError } = await supabase
          .from('agent_profiles')
          .select('memory_score')
          .eq('agent_name', agentName)
          .single();

        if (agentError) throw agentError;

        // Get alert count
        const { data: alertData, error: alertError } = await supabase
          .from('agent_alerts')
          .select('count', { count: 'exact' })
          .eq('agent', agentName)
          .eq('status', 'unresolved');

        if (alertError) throw alertError;

        // Determine status based on health score and alerts
        const health_score = agentData?.memory_score || 50;
        const alertCount = alertData?.length || 0;
        
        let status: 'healthy' | 'warning' | 'critical';
        if (health_score > 75) {
          status = 'healthy';
        } else if (health_score > 40) {
          status = 'warning';
        } else {
          status = 'critical';
        }

        setHealthData({
          health_score,
          alertCount,
          last_check: new Date().toISOString(),
          status
        });
      } catch (err) {
        console.error('Error fetching agent health data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch agent health data'));
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, [agentName]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner size="md" label="Loading agent health data..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!agentName) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agent Health</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No agent selected</p>
        </CardContent>
      </Card>
    );
  }

  if (!healthData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agent Health</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No health data available for this agent</p>
        </CardContent>
      </Card>
    );
  }

  const getHealthColor = () => {
    switch (healthData.status) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-amber-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Health Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Health Score</span>
              <span className="text-sm font-medium">{healthData.health_score}%</span>
            </div>
            <Progress value={healthData.health_score} className={getHealthColor()} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-md p-3">
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <p className="mt-1 font-semibold capitalize">{healthData.status}</p>
            </div>
            <div className="border rounded-md p-3">
              <h3 className="text-sm font-medium text-muted-foreground">Active Alerts</h3>
              <p className="mt-1 font-semibold">{healthData.alertCount}</p>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Last checked: {new Date(healthData.last_check).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
