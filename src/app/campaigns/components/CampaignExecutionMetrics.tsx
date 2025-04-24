import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, MousePointer } from "lucide-react";
import { Campaign } from "@/types/campaign";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CampaignExecutionMetricsProps {
  campaign: Campaign;
  isLoading?: boolean;
}

const MetricCard = ({ 
  title, 
  value, 
  icon, 
  description, 
  trend, 
  isLoading 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  description?: string; 
  trend?: { value: number; label: string; }; 
  isLoading?: boolean;
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        {isLoading ? (
          <>
            <Skeleton className="h-4 w-1/3 mb-2" />
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Skeleton className="h-4 w-2/3" />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div className="p-2 bg-primary/10 rounded-full">{icon}</div>
            </div>
            <div className="text-2xl font-bold mt-2">{value}</div>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span className={cn(
                  "text-xs font-medium",
                  trend.value > 0 ? "text-green-600" : 
                  trend.value < 0 ? "text-red-600" : "text-muted-foreground"
                )}>
                  {trend.value > 0 ? "+" : ""}{trend.value}%
                </span>
                <span className="text-xs text-muted-foreground">{trend.label}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export function CampaignExecutionMetrics({ campaign, isLoading = false }: CampaignExecutionMetricsProps) {
  const metrics = campaign?.execution_metrics || {
    views: 0,
    clicks: 0, 
    conversions: 0,
    ctr: 0,
    conversionRate: 0
  };
  
  const ctr = metrics.views > 0 
    ? (((metrics.clicks || 0) / metrics.views) * 100).toFixed(1) 
    : "0.0";
    
  const conversionRate = metrics.clicks > 0
    ? (((metrics.conversions || 0) / metrics.clicks) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Campaign Performance</h2>
        <div>
          <DateRangePicker />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Total Views"
          value={metrics.views || 0}
          icon={<Users className="h-4 w-4 text-primary" />}
          description="Number of times your campaign was shown"
          trend={{ value: 12, label: "vs. last week" }}
          isLoading={isLoading}
        />
        
        <MetricCard 
          title="Total Clicks"
          value={metrics.clicks || 0}
          icon={<MousePointer className="h-4 w-4 text-primary" />}
          description="Number of interactions with your campaign"
          trend={{ value: 8, label: "vs. last week" }}
          isLoading={isLoading}
        />
        
        <MetricCard 
          title="Click-through Rate"
          value={`${ctr}%`}
          icon={<BarChart3 className="h-4 w-4 text-primary" />}
          description="Percentage of views that resulted in clicks"
          trend={{ value: 3, label: "vs. last week" }}
          isLoading={isLoading}
        />
        
        <MetricCard 
          title="Conversions"
          value={metrics.conversions || 0}
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
          description="Number of successful campaign outcomes"
          trend={{ value: -2, label: "vs. last week" }}
          isLoading={isLoading}
        />
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Campaign Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Overall Performance</span>
                <Badge variant={metrics.health === "poor" ? "destructive" : "default"}>
                  {metrics.health === "poor" ? "Needs Attention" : "Good"}
                </Badge>
              </div>
              <Progress value={metrics.health === "poor" ? 35 : 75} className="h-2" />
            </div>
            
            <div className="text-sm text-muted-foreground">
              {metrics.health === "poor" 
                ? "Your campaign is underperforming. Consider reviewing the targeting or messaging."
                : "Your campaign is performing well against benchmarks for your industry."}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
