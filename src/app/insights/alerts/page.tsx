
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUnifiedKpiAlerts } from '@/hooks/useUnifiedKpiAlerts';
import AlertCard from './components/AlertCard';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function AlertsPage() {
  const [severity, setSeverity] = useState<string | undefined>(undefined);
  const [days, setDays] = useState(7);
  
  const { 
    alerts, 
    isLoading, 
    error,
    triggerKpiCheck,
    refreshAlerts
  } = useUnifiedKpiAlerts({
    severity,
    days
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🚨 Alert Center</h1>
        <Button
          onClick={() => triggerKpiCheck()}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Run KPI Check
            </>
          )}
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Alert Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setSeverity(value === "all" ? undefined : value)}>
            <TabsList>
              <TabsTrigger value="all">All Alerts</TabsTrigger>
              <TabsTrigger value="high">High Impact</TabsTrigger>
              <TabsTrigger value="medium">Medium Impact</TabsTrigger>
              <TabsTrigger value="low">Low Impact</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Tabs defaultValue="7" className="w-full" onValueChange={(value) => setDays(parseInt(value))}>
            <TabsList>
              <TabsTrigger value="1">Last 24h</TabsTrigger>
              <TabsTrigger value="7">Last 7 days</TabsTrigger>
              <TabsTrigger value="30">Last 30 days</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="text-center py-8">Loading alerts...</div>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-500">Error loading alerts: {error.message}</p>
          </CardContent>
        </Card>
      ) : alerts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-xl mb-2">No alerts found</p>
            <p className="text-muted-foreground mb-6">
              No alerts match your current filters. Try changing your filters or check back later.
            </p>
            <Button 
              variant="outline" 
              onClick={() => refreshAlerts()}
            >
              Refresh Alerts
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {alerts.map((alert) => (
            <AlertCard 
              key={alert.id}
              title={alert.kpi_name}
              description={alert.description}
              impact={alert.severity}
              date={alert.created_at}
              action={alert.message}
              sourceType={alert.source_type}
            />
          ))}
        </div>
      )}
    </div>
  );
}
