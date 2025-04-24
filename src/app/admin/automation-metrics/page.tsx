
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function AutomationMetricsPage() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['automation-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_metrics')
        .select('*')
        .order('metric_name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });
  
  const calculateRatio = (aiCount: number, humanCount: number) => {
    const total = aiCount + humanCount;
    if (total === 0) return { ai: 0, human: 0, ratio: '0%' };
    
    const aiPercentage = Math.round((aiCount / total) * 100);
    return {
      ai: aiPercentage,
      human: 100 - aiPercentage,
      ratio: `${aiPercentage}%`
    };
  };
  
  const getOverallRatio = () => {
    if (!metrics || metrics.length === 0) return { ai: 0, human: 0, ratio: '0%' };
    
    const totalAI = metrics.reduce((sum, item) => sum + (item.ai_count || 0), 0);
    const totalHuman = metrics.reduce((sum, item) => sum + (item.human_count || 0), 0);
    
    return calculateRatio(totalAI, totalHuman);
  };
  
  const overallRatio = getOverallRatio();
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Automation Metrics Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor AI/human interaction ratios and automation performance across the platform
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Overall AI/Human Ratio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <div>AI: {overallRatio.ai}%</div>
              <div>Human: {overallRatio.human}%</div>
            </div>
            <div className="flex h-4 rounded-full overflow-hidden">
              <div 
                className="bg-primary" 
                style={{ width: `${overallRatio.ai}%` }}
              />
              <div 
                className="bg-muted" 
                style={{ width: `${overallRatio.human}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <div>Target: 90% AI</div>
              <div>{overallRatio.ratio} Achieved</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="detailed">
        <TabsList>
          <TabsTrigger value="detailed">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="detailed" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics?.map((metric) => {
              const ratio = calculateRatio(metric.ai_count || 0, metric.human_count || 0);
              return (
                <Card key={metric.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg capitalize">
                      {metric.metric_name.replace(/_/g, ' ')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <div>AI: {metric.ai_count || 0}</div>
                        <div>Human: {metric.human_count || 0}</div>
                      </div>
                      <Progress value={ratio.ai} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <div>Last updated: {new Date(metric.updated_at).toLocaleDateString()}</div>
                        <div>{ratio.ratio} AI</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {(!metrics || metrics.length === 0) && (
            <div className="text-center py-8 bg-muted/10 rounded-lg">
              <p className="text-muted-foreground">No automation metrics found</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Strategy Development</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics?.filter(m => m.metric_name.includes('strategy'))
                  .map((metric) => {
                    const ratio = calculateRatio(metric.ai_count || 0, metric.human_count || 0);
                    return (
                      <div key={metric.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <div className="capitalize">{metric.metric_name.replace(/_/g, ' ')}</div>
                          <div>{ratio.ratio} AI</div>
                        </div>
                        <Progress value={ratio.ai} className="h-1.5" />
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Campaign Automation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics?.filter(m => m.metric_name.includes('campaign'))
                  .map((metric) => {
                    const ratio = calculateRatio(metric.ai_count || 0, metric.human_count || 0);
                    return (
                      <div key={metric.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <div className="capitalize">{metric.metric_name.replace(/_/g, ' ')}</div>
                          <div>{ratio.ratio} AI</div>
                        </div>
                        <Progress value={ratio.ai} className="h-1.5" />
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Agent Interactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics?.filter(m => m.metric_name.includes('agent'))
                  .map((metric) => {
                    const ratio = calculateRatio(metric.ai_count || 0, metric.human_count || 0);
                    return (
                      <div key={metric.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <div className="capitalize">{metric.metric_name.replace(/_/g, ' ')}</div>
                          <div>{ratio.ratio} AI</div>
                        </div>
                        <Progress value={ratio.ai} className="h-1.5" />
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
