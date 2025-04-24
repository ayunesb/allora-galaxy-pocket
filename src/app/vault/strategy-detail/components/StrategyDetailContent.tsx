
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { StrategyHeader } from "@/app/strategy/components/StrategyHeader";
import { StrategyActions } from "@/app/strategy/components/StrategyActions";
import { StrategyTabs } from "@/app/strategy/components/StrategyTabs";
import { StrategyVersions } from "@/app/strategy/components/StrategyVersions";
import { StrategyKPIEvaluation } from "@/app/strategy/components/StrategyKPIEvaluation";
import { StrategyRecommendations } from "@/app/strategy/components/StrategyRecommendations";
import { StrategyFeedbackForm } from "@/components/StrategyFeedbackForm";
import { StrategyPerformanceTracker } from "@/components/StrategyPerformanceTracker";
import { useStrategySystem } from "@/hooks/useStrategySystem";
import { useStrategyDetail } from "@/hooks/useStrategyDetail";
import { useToast } from "@/hooks/use-toast";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";

export function StrategyDetailContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comparisonData, setComparisonData] = useState<any>(null);
  const { createStrategyVersion, versions, compareVersions } = useStrategySystem();
  const { 
    strategy, 
    isLoading, 
    error,
    feedbackItems,
    isLoadingFeedback,
    handleApprove 
  } = useStrategyDetail(id);

  const { tenant } = useTenant();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { logActivity } = useSystemLogs();

  const { mutate: saveFeedback } = useMutation({
    mutationFn: async ({ action }: { action: 'used' | 'dismissed' }) => {
      if (!tenant?.id || !user?.id || !strategy) return;

      await supabase
        .from('strategy_feedback')
        .insert({
          tenant_id: tenant.id,
          user_id: user.id,
          strategy_title: strategy.title,
          action: action
        });

      return action;
    },
    onSuccess: (action) => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      queryClient.invalidateQueries({ queryKey: ['strategy-feedback', id] });
      
      toast({
        title: action === 'used' ? 'Strategy approved' : 'Strategy declined',
        description: action === 'used' ? 'The strategy has been approved' : 'The strategy has been declined'
      });
      
      logActivity({
        event_type: action === 'used' ? 'strategy_approved' : 'strategy_declined',
        message: `${action === 'used' ? 'Approved' : 'Declined'} strategy: ${strategy?.title}`,
        meta: {
          strategy_id: id,
          action: action
        }
      });
    }
  });

  const handleDecline = () => {
    saveFeedback({ action: 'dismissed' });
  };

  const handleRegenerate = () => {
    if (!strategy) return;
    
    toast({
      title: "Regenerating strategy",
      description: "The AI is creating a new version of this strategy"
    });
    
    logActivity({ 
      event_type: 'strategy_regenerated',
      message: `Requested regeneration of strategy: ${strategy.title}`,
      meta: { strategy_id: id }
    });
  };

  const handleCreateVersion = async () => {
    if (!strategy) return;
    
    await createStrategyVersion({
      strategyId: strategy.id,
      changes: strategy.description || ''
    });
    
    toast({
      title: "Version created",
      description: "A new version of this strategy has been saved"
    });
  };

  const handleCompareVersions = async (v1: number, v2: number) => {
    if (!strategy) return;
    
    try {
      const comparison = await compareVersions(strategy.id, v1, v2);
      if (comparison) {
        setComparisonData(comparison);
      }
    } catch (error) {
      console.error("Error comparing versions:", error);
      toast({
        title: "Comparison failed",
        description: "Failed to compare strategy versions",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (!tenant?.id || !strategy?.title) return;
    
    const channel = supabase
      .channel('strategy_feedback_changes')
      .on('postgres_changes', 
        {
          event: '*', 
          schema: 'public', 
          table: 'strategy_feedback',
          filter: `tenant_id=eq.${tenant.id}` 
        }, 
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['strategy-feedback', id] });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenant?.id, strategy?.title, id, queryClient]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );
  }

  if (error || !strategy) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error ? (error as Error).message : "Strategy not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <StrategyHeader 
          strategy={strategy}
          onNavigate={navigate}
        />
        
        <CardContent>
          <StrategyTabs strategy={strategy}>
            {{
              overview: <p>{strategy.description}</p>,
              goals: <p>{strategy.goal || "No specific goals defined for this strategy."}</p>,
              performance: (
                <StrategyPerformanceTracker 
                  strategyId={strategy.id} 
                  initialMetrics={strategy.metrics_baseline || {}}
                />
              ),
              versions: (
                <StrategyVersions
                  strategy={strategy}
                  versions={versions}
                  onCreateVersion={handleCreateVersion}
                  onCompareVersions={handleCompareVersions}
                  comparisonData={comparisonData}
                />
              ),
              feedback: (
                <StrategyFeedbackForm 
                  strategyId={strategy.id}
                  onFeedbackSubmitted={() => queryClient.invalidateQueries({ queryKey: ['strategy-feedback', id] })}
                />
              ),
              evaluation: (
                <StrategyKPIEvaluation strategyId={strategy.id} />
              ),
              recommendations: (
                <StrategyRecommendations strategyId={strategy.id} />
              )
            }}
          </StrategyTabs>
        </CardContent>

        <StrategyActions
          onApprove={handleApprove}
          onDecline={handleDecline}
          onRegenerate={handleRegenerate}
        />
      </Card>
    </div>
  );
}
