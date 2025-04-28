
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

// Define the type for recommendation items
interface StrategyRecommendation {
  id: string;
  strategy_id: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'implemented' | 'rejected';
  created_at: string;
  implemented_at?: string | null;
}

interface StrategyRecommendationsProps {
  strategyId: string;
}

export function StrategyRecommendations({ strategyId }: StrategyRecommendationsProps) {
  const queryClient = useQueryClient();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['strategy-recommendations', strategyId],
    queryFn: async () => {
      // For now, let's use mock data since the table may not exist yet
      // We'll simulate the data structure we expect from Supabase
      const mockData: StrategyRecommendation[] = [
        {
          id: '1',
          strategy_id: strategyId,
          recommendation: 'Increase social media posting frequency to 3x per week',
          priority: 'high',
          status: 'pending',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          strategy_id: strategyId,
          recommendation: 'Add email newsletter to nurture leads',
          priority: 'medium',
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ];
      
      return mockData;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      // For now, let's just simulate the update
      console.log(`Updating recommendation ${id} to status ${status}`);
      // In a real implementation, we would call Supabase here
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
