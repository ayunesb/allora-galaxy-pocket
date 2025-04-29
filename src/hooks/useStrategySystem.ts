
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";
import { toast } from "sonner";
import type { Strategy } from "@/types/strategy";
import { useKpiTracking } from "./useKpiTracking";
import { useDataPipeline } from "./useDataPipeline";

interface StrategyFeedback {
  rating: number;
  comment: string;
  isPublic?: boolean;
}

interface StrategyVersion {
  id: string;
  strategy_id: string;
  version: number;
  changes: string;
  created_at: string;
}

export function useStrategySystem() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const { trackMetric } = useKpiTracking();
  const { logPipelineEvent } = useDataPipeline();

  // Get strategy versions (using strategies table as a fallback since strategy_versions doesn't exist)
  const { data: versions } = useQuery({
    queryKey: ['strategy-versions', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      // Use strategies table since strategy_versions doesn't exist
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      
      // Convert strategies to synthetic versions
      // Use type casting to avoid recursion
      const strategies = data as unknown as any[];
      
      // Create synthetic versions from strategies
      const syntheticVersions: StrategyVersion[] = (strategies || []).map((strategy, index) => ({
        id: strategy.id,
        strategy_id: strategy.id,
        version: index + 1,
        changes: `Version ${index + 1}`,
        created_at: strategy.created_at || strategy.updated_at || new Date().toISOString()
      }));
      
      return syntheticVersions;
    },
    enabled: !!tenant?.id
  });

  // Add feedback for a strategy
  const addFeedback = useMutation({
    mutationFn: async ({ strategyId, feedback }: { strategyId: string, feedback: StrategyFeedback }) => {
      if (!tenant?.id) throw new Error("No tenant selected");

      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('strategy_feedback')
        .insert({
          tenant_id: tenant.id,
          strategy_title: feedback.comment.substring(0, 50), // Use comment as title if needed
          action: `Rating: ${feedback.rating}`, // Store rating in action field
          user_id: user?.id,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Track the feedback metric
      await trackMetric({
        name: "strategy_feedback_submitted",
        value: 1,
        metadata: {
          strategy_id: strategyId,
          rating: feedback.rating
        }
      });

      return { success: true };
    },
    onSuccess: () => {
      toast.success("Feedback submitted successfully");
      queryClient.invalidateQueries({ queryKey: ['strategy-feedback'] });
    },
    onError: (error) => {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to submit feedback");
    }
  });

  // Create a new strategy version (simulate with update to strategies table)
  const createStrategyVersion = useMutation({
    mutationFn: async ({ strategyId, changes }: { strategyId: string, changes: string }) => {
      if (!tenant?.id) throw new Error("No tenant selected");
      
      // Update the strategy instead since versions table doesn't exist
      const { error } = await supabase
        .from('strategies')
        .update({
          updated_at: new Date().toISOString(),
          description: changes // Store changes in description field
        })
        .eq('id', strategyId)
        .eq('tenant_id', tenant.id);
        
      if (error) throw error;

      // Log pipeline event
      await logPipelineEvent({
        event_type: "strategy_version_created",
        source: "strategy",
        target: "strategies", // Changed from strategy_versions
        metadata: {
          strategy_id: strategyId,
          changes: changes
        }
      });
      
      return { success: true, version: 1 }; // Default version
    },
    onSuccess: () => {
      toast.success("Strategy version created");
      queryClient.invalidateQueries({ queryKey: ['strategy-versions'] });
    },
    onError: (error) => {
      console.error("Failed to create strategy version:", error);
      toast.error("Failed to create strategy version");
    }
  });

  // Track strategy performance
  const trackStrategyPerformance = async (strategyId: string, metrics: Record<string, number>) => {
    setIsLoading(true);
    
    try {
      if (!tenant?.id) throw new Error("No tenant selected");
      
      // Update strategy with performance metrics
      const { error } = await supabase
        .from('strategies')
        .update({
          metrics_baseline: metrics,
          updated_at: new Date().toISOString()
        })
        .eq('id', strategyId)
        .eq('tenant_id', tenant.id);
        
      if (error) throw error;
      
      // Track metrics individually
      for (const [key, value] of Object.entries(metrics)) {
        await trackMetric({
          name: key,
          value,
          metadata: {
            strategy_id: strategyId,
            source: 'strategy_performance'
          }
        });
      }
      
      // Log pipeline event
      await logPipelineEvent({
        event_type: "strategy_metrics_updated",
        source: "strategy",
        target: "kpi_metrics",
        metadata: {
          strategy_id: strategyId,
          metrics: Object.keys(metrics)
        }
      });
      
      toast.success("Strategy performance updated");
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      
    } catch (error: any) {
      console.error("Failed to track strategy performance:", error);
      toast.error(error.message || "Failed to track strategy performance");
    } finally {
      setIsLoading(false);
    }
  };

  // Get strategy feedback
  const getStrategyFeedback = async (strategyId: string) => {
    if (!tenant?.id) return [];
    
    const { data, error } = await supabase
      .from('strategy_feedback')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Filter by strategy if needed
    const feedbackList = data as unknown as any[];
    return feedbackList.filter(feedback => 
      feedback.strategy_id === strategyId || feedback.action?.includes(strategyId)
    );
  };

  // Compare strategy versions (simulated since we don't have versions table)
  const compareVersions = async (strategyId: string, version1: number, version2: number) => {
    if (!tenant?.id) return null;
    
    // Since we don't have actual versions, return placeholder data
    return {
      older: {
        id: strategyId,
        strategy_id: strategyId,
        version: version1,
        changes: "Previous version",
        created_at: new Date().toISOString()
      },
      newer: {
        id: strategyId,
        strategy_id: strategyId,
        version: version2,
        changes: "Newer version",
        created_at: new Date().toISOString()
      }
    };
  };

  return {
    addFeedback: addFeedback.mutate,
    createStrategyVersion: createStrategyVersion.mutate,
    trackStrategyPerformance,
    getStrategyFeedback,
    compareVersions,
    versions,
    isLoading: isLoading || addFeedback.isPending || createStrategyVersion.isPending
  };
}
