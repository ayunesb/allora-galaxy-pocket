
import { useState } from 'react';
import { AlertCard } from "./components/AlertCard";
import { useKpiAlerts } from "./hooks/useKpiAlerts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export default function KPIAlertsPage() {
  const [severity, setSeverity] = useState<string>("");
  const { data: alerts, isLoading, error } = useKpiAlerts(severity);

  const handleForward = async (id: string) => {
    const { error } = await supabase
      .rpc('handleAIInsightForward', { insight_id: id });
    
    if (error) {
      console.error('Error forwarding insight:', error);
    }
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('kpi_insights')
      .update({ status: 'resolved' })
      .eq('id', id);
    
    if (error) {
      console.error('Error approving insight:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        Error loading alerts: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">KPI Alerts</h1>
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All severities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {alerts?.map((alert) => (
          <AlertCard
            key={alert.id}
            {...alert}
            onForward={handleForward}
            onApprove={handleApprove}
          />
        ))}
        {alerts?.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No alerts found for the selected criteria
          </div>
        )}
      </div>
    </div>
  );
}
