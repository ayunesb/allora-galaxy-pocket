import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { KpiSection } from "@/app/dashboard/components/KpiSection";
import { MetricsCard } from "./MetricsCard";
import { PluginUsageChart } from "./PluginUsageChart";

export default function AdvancedAnalyticsDashboard() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Advanced Analytics Dashboard</h1>
      
      <Tabs defaultValue="metrics">
        <TabsList className="mb-6">
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="plugins">Plugin Analytics</TabsTrigger>
          <TabsTrigger value="kpis">KPI Overview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="metrics">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <MetricsCard title="AI Decisions" value="512" trend="up" percentage="12%" />
            <MetricsCard title="Human Approvals" value="35" trend="down" percentage="8%" />
            <MetricsCard title="AI to Human Ratio" value="14.6:1" trend="up" percentage="15%" />
            <MetricsCard title="Avg. Response Time" value="1.2s" trend="up" percentage="30%" />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Weekly Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <PluginUsageChart />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="plugins">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Plugin Usage Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <PluginUsageChart />
            </CardContent>
          </Card>
          
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <MetricsCard title="Most Used Plugin" value="Content Generator" trend="neutral" />
            <MetricsCard title="Fastest Growing" value="SEO Analyzer" trend="up" percentage="43%" />
            <MetricsCard title="Plugin Revenue" value="$2,450" trend="up" percentage="23%" />
          </div>
        </TabsContent>
        
        <TabsContent value="kpis">
          <KpiSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
