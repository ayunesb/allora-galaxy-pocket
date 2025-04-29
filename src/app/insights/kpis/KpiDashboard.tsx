
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useKpiMetrics } from "@/hooks/useKpiMetrics";
import { useKpiAlerts } from "@/hooks/useKpiAlerts";
import { AlertCircle, RefreshCw } from "lucide-react";
import { KpiMetricSummaryGrid } from "./components/KpiMetricSummaryGrid";
import { KpiLoadingState } from "./components/KpiLoadingState";
import { KpiErrorState } from "./components/KpiErrorState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KpiAlertsPanel } from "./components/KpiAlertsPanel";

export default function KpiDashboard() {
  const [timeframe, setTimeframe] = useState<number>(7);
  const { metrics, isLoading, refresh } = useKpiMetrics(); // Removed the argument
  const { alerts, isLoading: isLoadingAlerts } = useKpiAlerts({ activeOnly: true });

  const handleTimeframeChange = (days: number) => {
    setTimeframe(days);
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">
            KPI Metrics Dashboard
          </CardTitle>
          <Button variant="outline" onClick={() => refresh()} disabled={isLoading}>
            {isLoading ? (
              <>
                <AlertCircle className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="summary" className="space-y-4">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>
            <TabsContent value="summary">
              {isLoading ? (
                <KpiLoadingState />
              ) : metrics && metrics.length > 0 ? (
                <>
                  <KpiMetricSummaryGrid metrics={metrics} />
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-4">
                      Performance Over Time
                    </h3>
                    {/* Placeholder for chart component */}
                    <p className="text-muted-foreground">
                      Historical data and charts will be displayed here.
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No KPI metrics found. Please add your KPI metrics to start
                    tracking your performance.
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="alerts">
              {isLoadingAlerts ? (
                <div className="flex items-center justify-center py-4">
                  <AlertCircle className="mr-2 h-4 w-4 animate-spin" />
                  Loading alerts...
                </div>
              ) : (
                <KpiAlertsPanel alerts={alerts} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
