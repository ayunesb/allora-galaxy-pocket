import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import type { Strategy } from "@/types/strategy";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { StrategyErrorBoundary } from "./components/StrategyErrorBoundary";
import { useStrategySystem } from "@/hooks/useStrategySystem";
import { StrategyFeedbackForm } from "@/components/StrategyFeedbackForm";
import { StrategyPerformanceTracker } from "@/components/StrategyPerformanceTracker";
import { StrategyHeader } from "./components/StrategyHeader";
import { StrategyActions } from "./components/StrategyActions";
import { StrategyTabs } from "./components/StrategyTabs";
import { StrategyVersions } from "./components/StrategyVersions";
import { StrategyKPIEvaluation } from "./components/StrategyKPIEvaluation";
import { StrategyRecommendations } from "./components/StrategyRecommendations";

function StrategyDetailContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { logActivity } = useSystemLogs();
  const [note, setNote] = useState("");
  const [showRawFeedback, setShowRawFeedback] = useState(false);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const { createStrategyVersion, versions, compareVersions } = useStrategySystem();

  const { data: strategy, isLoading, error } = useQuery({
    queryKey: ['strategy', id],
    queryFn: async () => {
      if (!id) throw new Error("Strategy ID is required");
      
      const { data, error } = await supabase
        .from('vault_strategies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Strategy;
    },
    enabled: !!id
  });

  const { data: feedbackItems, isLoading: isLoadingFeedback } = useQuery({
    queryKey: ['strategy-feedback', id],
    queryFn: async () => {
      if (!tenant?.id || !id) return [];
      
      const { data, error } = await supabase
        .from('strategy_feedback')
        .select(`
          id,
          action,
          user_id,
          created_at,
          tenant_id
        `)
        .eq('tenant_id', tenant.id)
        .eq('strategy_title', strategy?.title || '')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant?.id && !!strategy?.title
  });

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

  useEffect(() => {
    if (strategy && tenant?.id && user?.id) {
      logActivity({ 
        event_type: 'strategy_viewed',
        message: `Viewed strategy: ${strategy.title}`,
        meta: { strategy_id: id }
      });
    }
  }, [strategy, tenant?.id, user?.id, id]);

  const handleApprove = async () => {
    try {
      await supabase
        .from('vault_strategies')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', id);

      toast({
        title: "Strategy approved",
        description: "The strategy has been approved and is now active"
      });

      logActivity({
        event_type: 'strategy_approved',
        message: `Approved strategy: ${strategy?.title}`,
        meta: { strategy_id: id }
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error approving strategy",
        description: "Could not approve the strategy. Please try again.",
        variant: "destructive"
      });
    }
  };

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

export default function StrategyDetail() {
  return (
    <StrategyErrorBoundary>
      <StrategyDetailContent />
    </StrategyErrorBoundary>
  );
}
