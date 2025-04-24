
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KPIChart } from "@/components/KPIChart";
import { toast } from "sonner";

interface StrategyKPIEvaluationProps {
  strategyId: string;
}

export function StrategyKPIEvaluation({ strategyId }: StrategyKPIEvaluationProps) {
  const { data: evaluations, isLoading } = useQuery({
    queryKey: ['strategy-kpi-evaluations', strategyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategy_kpi_evaluations')
        .select('*')
        .eq('strategy_id', strategyId)
        .order('evaluation_date', { ascending: true });

      if (error) {
        toast.error("Failed to load KPI evaluations");
        throw error;
      }

      return data;
    },
  });

  const chartData = evaluations?.map(evaluation => ({
    date: new Date(evaluation.evaluation_date).toLocaleDateString(),
    value: Number(evaluation.actual_value)
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>KPI Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-48 flex items-center justify-center">
            Loading evaluations...
          </div>
        ) : evaluations?.length ? (
          <>
            <KPIChart 
              data={chartData}
              height={200}
            />
            <div className="mt-4 space-y-2">
              {evaluations.map(evaluation => (
                <div 
                  key={evaluation.id}
                  className={`p-3 rounded-lg ${
                    evaluation.status === 'exceeded' ? 'bg-green-100' :
                    evaluation.status === 'met' ? 'bg-blue-100' :
                    'bg-amber-100'
                  }`}
                >
                  <p className="font-medium">{evaluation.kpi_name}</p>
                  <div className="text-sm">
                    <span>Target: {evaluation.target_value}</span>
                    <span className="mx-2">|</span>
                    <span>Actual: {evaluation.actual_value}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No KPI evaluations available yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
