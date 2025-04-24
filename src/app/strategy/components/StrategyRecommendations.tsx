
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

interface StrategyRecommendationsProps {
  strategyId: string;
}

export function StrategyRecommendations({ strategyId }: StrategyRecommendationsProps) {
  const queryClient = useQueryClient();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['strategy-recommendations', strategyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategy_recommendations')
        .select('*')
        .eq('strategy_id', strategyId)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Failed to load recommendations");
        throw error;
      }

      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase
        .from('strategy_recommendations')
        .update({ 
          status,
          implemented_at: status === 'implemented' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-recommendations', strategyId] });
      toast.success("Recommendation status updated");
    },
    onError: () => {
      toast.error("Failed to update recommendation status");
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-48 flex items-center justify-center">
            Loading recommendations...
          </div>
        ) : recommendations?.length ? (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div 
                key={rec.id} 
                className={`p-4 rounded-lg border ${
                  rec.priority === 'high' ? 'border-red-200' :
                  rec.priority === 'medium' ? 'border-yellow-200' :
                  'border-blue-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-medium px-2 py-1 rounded ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {rec.priority.toUpperCase()} Priority
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(rec.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="mb-4">{rec.recommendation}</p>
                {rec.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({ 
                        id: rec.id, 
                        status: 'implemented'
                      })}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Implemented
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatusMutation.mutate({ 
                        id: rec.id, 
                        status: 'rejected'
                      })}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No recommendations available yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
