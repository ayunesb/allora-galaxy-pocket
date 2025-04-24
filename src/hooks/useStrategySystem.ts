
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

  // Get strategy versions
  const { data: versions } = useQuery({
    queryKey: ['strategy-versions', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('strategy_versions')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('version', { ascending: false });
        
      if (error) throw error;
      return data as StrategyVersion[];
    },
    enabled: !!tenant?.id
  });

  // Add feedback for a strategy
  const addFeedback = useMutation({
    mutationFn: async ({ strategyId, feedback }: { strategyId: string, feedback: StrategyFeedback }) => {
      if (!tenant?.id) throw new Error("No tenant selected");

      const { error } = await supabase
        .from('strategy_feedback')
        .insert({
          tenant_id: tenant.id,
          strategy_id: strategyId,
          rating: feedback.rating,
          comment: feedback.comment,
          is_public: feedback.isPublic || false,
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

  // Create a new strategy version
  const createStrategyVersion = useMutation({
    mutationFn: async ({ strategyId, changes }: { strategyId: string, changes: string }) => {
      if (!tenant?.id) throw new Error("No tenant selected");
      
      // Get current max version number
      const { data: versions, error: versionError } = await supabase
        .from('strategy_versions')
        .select('version')
        .eq('strategy_id', strategyId)
        .order('version', { ascending: false })
        .limit(1);
        
      if (versionError) throw versionError;
      
      const newVersion = versions && versions.length > 0 ? versions[0].version + 1 : 1;
      
      // Insert new version
      const { error } = await supabase
        .from('strategy_versions')
        .insert({
          tenant_id: tenant.id,
          strategy_id: strategyId,
          version: newVersion,
          changes
        });
        
      if (error) throw error;

      // Log pipeline event
      await logPipelineEvent({
        event_type: "strategy_version_created",
        source: "strategy",
        target: "strategy_versions",
        metadata: {
          strategy_id: strategyId,
          version: newVersion
        }
      });
      
      return { success: true, version: newVersion };
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
          metrics_baseline: metrics
        })
        .eq('id', strategyId);
        
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
      .eq('strategy_id', strategyId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  };

  // Compare strategy versions
  const compareVersions = async (strategyId: string, version1: number, version2: number) => {
    if (!tenant?.id) return null;
    
    const { data, error } = await supabase
      .from('strategy_versions')
      .select('*')
      .eq('strategy_id', strategyId)
      .in('version', [version1, version2])
      .order('version', { ascending: true });
      
    if (error) throw error;
    
    if (data.length !== 2) {
      throw new Error("Couldn't find both versions for comparison");
    }
    
    return {
      older: data[0],
      newer: data[1]
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
