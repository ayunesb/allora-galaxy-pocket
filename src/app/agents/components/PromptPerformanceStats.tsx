
import React from "react";
import { usePromptPerformance, generatePromptRecommendations } from "../hooks/usePromptPerformance";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";

export function PromptPerformanceStats({ agentName }: { agentName: string }) {
  const { data: performanceData, isLoading, error } = usePromptPerformance(agentName);
  const { tenant } = useTenant();
  const { toast } = useToast();
  
  // Calculate recommendation based on performance data
  const recommendation = performanceData && performanceData.length > 0
    ? generatePromptRecommendations(agentName, performanceData)
    : null;
  
  // Mutation to create an alert for the recommendation
  const createAlertMutation = useMutation({
    mutationFn: async () => {
      if (!recommendation || !tenant?.id) return;
      
      const { error } = await supabase.from("agent_alerts").insert({
        tenant_id: tenant.id,
        agent: agentName,
        alert_type: "prompt-switch-recommendation",
        message: recommendation.message,
        triggered_at: new Date().toISOString()
      });
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Alert created",
        description: "Performance alert has been created"
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating alert",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  if (isLoading) return <div className="text-sm text-muted-foreground">Loading performance data...</div>;
  if (error) return <div className="text-sm text-red-500">Error loading performance data</div>;
  if (!performanceData || performanceData.length === 0) return <div className="text-sm text-muted-foreground">No performance data available yet</div>;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Prompt Version Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Version</th>
                  <th className="text-left py-2">Total Runs</th>
                  <th className="text-left py-2">Success</th>
                  <th className="text-left py-2">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.map((data) => (
                  <tr key={data.version} className="border-b">
                    <td className="py-2">v{data.version}</td>
                    <td className="py-2">{data.total}</td>
                    <td className="py-2">{data.success_count}</td>
                    <td className="py-2">
                      {Math.round(data.success_rate * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {recommendation && (
            <div className="bg-yellow-100 text-sm p-3 rounded">
              <p className="font-medium">⚠️ Performance Alert</p>
              <p className="mb-2">
                Current v{recommendation.current_version} is underperforming by{" "}
                {Math.round(recommendation.performance_delta * 100)}% compared to v{recommendation.suggested_version}.
              </p>
              <div className="flex gap-2">
                <Link
                  to={`/agents/versions/compare/${agentName}?left=${recommendation.suggested_version}&right=${recommendation.current_version}`}
                  className="text-primary hover:underline"
                >
                  🔍 Compare versions
                </Link>
                <button 
                  onClick={() => createAlertMutation.mutate()} 
                  disabled={createAlertMutation.isPending}
                  className="text-green-700 hover:underline disabled:opacity-50"
                >
                  📢 Create alert
                </button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
