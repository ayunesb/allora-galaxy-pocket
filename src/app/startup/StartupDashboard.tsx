import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import { useTenant } from "@/hooks/useTenant";
import { Strategy } from "@/types/strategy";

export function StartupDashboard() {
  const { tenant } = useTenant();

  const { data: strategiesData, isLoading: isLoadingStrategies } = useQuery({
    queryKey: ['startup-strategies', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      // Transform to match Strategy interface
      return (data || []).map(item => ({
        ...item,
        metrics_target: item.metrics_target || {},
        metrics_baseline: item.metrics_baseline || {},
        tags: item.tags || [],
        goals: item.goals || [],
        channels: item.channels || [],
        kpis: item.kpis || [],
        generated_by: item.generated_by || 'CEO Agent',
        assigned_agent: item.assigned_agent || '',
        auto_approved: item.auto_approved || false,
        health_score: item.health_score || 0,
    } as Strategy));
  },
    enabled: !!tenant?.id
  });

  const strategies = strategiesData || [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-base font-semibold">AI Strategy Recommendations</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/strategy">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingStrategies ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-4 w-[60%]" />
              <Skeleton className="h-4 w-[40%]" />
            </div>
          ) : strategies.length > 0 ? (
            <div className="space-y-3">
              {strategies.map((strategy) => (
                <div key={strategy.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{strategy.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {strategy.description}
                    </p>
                  </div>
                  <Link to={`/strategy/${strategy.id}`}>
                    <Button variant="secondary" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No AI strategies available.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
