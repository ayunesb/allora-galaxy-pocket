
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { Loader2 } from "lucide-react";
import { Strategy } from "@/types/strategy";
import { StrategyReasonCard } from "@/components/strategy-reason/StrategyReasonCard";

export function StrategyDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { tenant } = useTenant();
  
  const { data: strategy, isLoading, error } = useQuery({
    queryKey: ['strategy-detail', id],
    queryFn: async (): Promise<Strategy | null> => {
      if (!id || !tenant?.id) return null;
      
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', tenant.id)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      
      // Cast and ensure all required fields exist
      const strategyData: Strategy = {
        ...data,
        id: data.id,
        status: data.status as Strategy['status'],
        created_at: data.created_at,
        description: data.description || '',
        title: data.title || '',
        // Add default values for potentially missing fields
        tags: data.tags || [],
        goals: data.goals || [],
        channels: data.channels || [],
        kpis: data.kpis || [],
        target_audience: data.target_audience || '',
        reason_for_recommendation: data.reason_for_recommendation || '',
        updated_at: data.updated_at || data.created_at,
        version: data.version || 1,
        metrics_baseline: data.metrics_baseline || {},
        metrics_target: data.metrics_target || {},
        diagnosis: data.diagnosis || {},
        tenant_id: data.tenant_id,
        user_id: data.user_id,
        generated_by: data.generated_by || 'CEO Agent',
        assigned_agent: data.assigned_agent || '',
        auto_approved: data.auto_approved || false,
        health_score: data.health_score || 0
      };
      
      return strategyData;
    },
    enabled: !!id && !!tenant?.id
  });
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );
  }
  
  if (error || !strategy) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Strategy Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The strategy you are looking for could not be found or you don't have access to it.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{strategy.title || "Untitled Strategy"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p>{strategy.description || "No description provided."}</p>
          
          {strategy.reason_for_recommendation && (
            <StrategyReasonCard strategy={strategy} />
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {strategy.goals?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside">
                    {strategy.goals.map((goal, i) => (
                      <li key={i}>{goal}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            
            {strategy.channels?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Channels</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside">
                    {strategy.channels.map((channel, i) => (
                      <li key={i}>{channel}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            
            {strategy.kpis?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">KPIs</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside">
                    {strategy.kpis.map((kpi, i) => (
                      <li key={i}>{kpi}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
