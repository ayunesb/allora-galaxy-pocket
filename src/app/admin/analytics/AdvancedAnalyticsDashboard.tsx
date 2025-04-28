
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KPISection from "@/app/dashboard/components/KPISection";
import { PluginUsageChart } from "./PluginUsageChart";
import { MetricsCard } from "./MetricsCard";

export function AdvancedAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState("30");
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Advanced Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricsCard 
          title="Active Users" 
          value="23"
          change="+12%"
          trend="up"
        />
        <MetricsCard 
          title="Completed Strategies" 
          value="157"
          change="+8%"
          trend="up"
        />
        <MetricsCard 
          title="Campaign Success Rate" 
          value="76%"
          change="-3%"
          trend="down"
        />
      </div>
      
      <Tabs defaultValue="kpis" className="mb-8">
        <TabsList>
          <TabsTrigger value="kpis">KPI Metrics</TabsTrigger>
          <TabsTrigger value="plugins">Plugin Usage</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="kpis">
          <Card>
            <CardHeader>
              <CardTitle>KPI Metrics</CardTitle>
              <CardDescription>Key Performance Indicators across all campaigns</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <KPISection />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="plugins">
          <Card>
            <CardHeader>
              <CardTitle>Plugin Usage</CardTitle>
              <CardDescription>Plugin usage across your workspace</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <PluginUsageChart />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
              <CardDescription>Agent performance metrics and success rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-muted-foreground">
                Agent performance metrics will display here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdvancedAnalyticsDashboard;
