'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useKpiMetrics } from "./hooks/useKpiMetrics";
import KpiCard from "./components/KpiCard";
import { exportToCSV } from "@/lib/export/exportCSV";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";

export default function KpiDashboardPage() {
  const [dateRange, setDateRange] = useState("30");
  const [category, setCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: metrics, isLoading, error } = useKpiMetrics(dateRange, category, searchQuery);
  const { tenant } = useTenant();

  const handleExportCSV = () => {
    if (metrics) {
      exportToCSV(
        metrics.map(metric => ({
          Name: metric.kpi_name,
          Value: metric.value,
          Target: metric.target || 'N/A',
          Status: metric.status || 'N/A',
          'Last Updated': metric.updated_at
        })),
        'KPI_Metrics_Export'
      );
    }
  };

  const fetchLiveGA4Metrics = async () => {
    if (!tenant?.id) {
      toast.error("No tenant selected");
      return;
    }

    try {
      const response = await supabase.functions.invoke('fetch-ga4-metrics', {
        body: JSON.stringify({ tenant_id: tenant.id })
      });

      if (response.error) {
        toast.error("Failed to fetch GA4 metrics", {
          description: response.error.message
        });
      } else {
        toast.success("GA4 metrics fetched and stored successfully!");
        // Optionally, you can invalidate and refetch KPI metrics here
      }
    } catch (error) {
      toast.error("Error fetching GA4 metrics", {
        description: error instanceof Error ? error.message : String(error)
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📊 KPI Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Button onClick={fetchLiveGA4Metrics} variant="outline">
            📈 Fetch Live GA4 Metrics
          </Button>
          <Button onClick={handleExportCSV} variant="outline">
            Export to CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger>
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>

        <Input 
          placeholder="Search KPIs" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Filter Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Sales">Sales</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Operations">Operations</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && <div>Loading KPIs...</div>}
      {error && <div>Error loading KPIs: {error.message}</div>}

      {metrics && metrics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric) => (
            <KpiCard key={metric.id} {...metric} />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No KPIs Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There are no KPIs available for the selected filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
