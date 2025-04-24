
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, ArrowUpRight, BellRing, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export function SystemAlertsPanel() {
  const { data: alerts, isLoading, refetch } = useQuery({
    queryKey: ['system-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: healthAlerts = [], isLoading: isLoadingHealth } = useQuery({
    queryKey: ['health-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_health_alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data || [];
    },
  });

  const generateAlertSuggestions = async () => {
    try {
      toast.loading('Analyzing metrics for alert suggestions...');
      
      // Call your edge function to generate alert suggestions
      const { data, error } = await supabase.functions.invoke('generate-alert-suggestions', {
        body: {}
      });
      
      if (error) throw error;
      
      toast.success('Alert suggestions generated', {
        description: 'Review the suggestions in the alert configuration panel'
      });
    } catch (err) {
      console.error('Error generating alert suggestions:', err);
      toast.error('Failed to generate alert suggestions');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return <AlertCircle className="h-4 w-4" />;
      case 'medium':
        return <BellRing className="h-4 w-4" />;
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>System Alerts</CardTitle>
          <CardDescription>Intelligent system alerts and notifications</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={generateAlertSuggestions}>
          Generate Suggestions
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : alerts && alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map(alert => (
              <Alert key={alert.id} variant="default" className="relative">
                <div className="absolute top-3 right-3">
                  <Badge variant={getSeverityColor(alert.severity)}>
                    {getSeverityIcon(alert.severity)}
                    <span className="ml-1">{alert.severity}</span>
                  </Badge>
                </div>
                <AlertTitle className="flex items-center gap-2 mb-1">
                  {alert.alert_type}
                  <span className="text-xs text-muted-foreground">
                    {new Date(alert.created_at).toLocaleString()}
                  </span>
                </AlertTitle>
                <AlertDescription className="text-sm">
                  {alert.message}
                </AlertDescription>
                <div className="mt-2 flex">
                  <Button size="sm" variant="ghost" className="text-xs h-7 px-2">
                    <ArrowUpRight className="h-3 w-3 mr-1" /> View Details
                  </Button>
                </div>
              </Alert>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <BellRing className="h-12 w-12 mb-2 mx-auto" />
            <p>No active system alerts</p>
          </div>
        )}

        {healthAlerts.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-2">Health Alerts</h3>
            <div className="space-y-2">
              {healthAlerts.map(alert => (
                <div 
                  key={alert.id}
                  className="border rounded p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-sm">{alert.alert_type}</p>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                  <Badge variant={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
