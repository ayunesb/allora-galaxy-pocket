
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KPIChart } from "@/components/KPIChart";
import { toast } from "sonner";

interface StrategyKPIEvaluation {
  id: string;
  strategy_id: string;
  kpi_name: string;
  target_value: number;
  actual_value: number;
  status: 'exceeded' | 'met' | 'not_met';
  evaluation_date: string;
}

interface StrategyKPIEvaluationProps {
  strategyId: string;
}

export function StrategyKPIEvaluation({ strategyId }: StrategyKPIEvaluationProps) {
  const { data: evaluations, isLoading } = useQuery({
    queryKey: ['strategy-kpi-evaluations', strategyId],
    queryFn: async () => {
      // Since the table doesn't exist yet, return mock data
      // In a real implementation, this would be:
      // const { data, error } = await supabase
      //   .from('strategy_kpi_evaluations')
      //   .select('*')
      //   .eq('strategy_id', strategyId)
      //   .order('evaluation_date', { ascending: true });
      
      // Mock data for development
      const mockData: StrategyKPIEvaluation[] = [
        {
          id: '1',
          strategy_id: strategyId,
          kpi_name: 'Conversion Rate',
          target_value: 5,
          actual_value: 5.8,
          status: 'exceeded',
          evaluation_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          strategy_id: strategyId,
          kpi_name: 'Click-through Rate',
          target_value: 2.5,
          actual_value: 2.2,
          status: 'not_met',
          evaluation_date: new Date().toISOString()
        }
      ];
      
      return mockData;
    }
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
