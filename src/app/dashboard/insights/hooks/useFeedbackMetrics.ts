
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import type { TrendType } from "./useKpiHistory";

export function useFeedbackMetrics(dateRange: string) {
  const { tenant } = useTenant();
  const formattedStartDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const [feedbackPositivityRatio, setFeedbackPositivityRatio] = useState({ 
    current: 0, 
    trend: 'neutral' as TrendType, 
    change: 0 
  });

  const { data: feedbackData } = useQuery({
    queryKey: ['strategy-feedback', tenant?.id, dateRange],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from('strategy_feedback')
        .select('*')
        .eq('tenant_id', tenant.id)
        .gte('created_at', formattedStartDate);

      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id
  });

  useEffect(() => {
    if (feedbackData) {
      const positiveItems = feedbackData.filter((item: any) => item.action === 'used').length;
      const negativeItems = feedbackData.filter((item: any) => item.action === 'dismissed').length;
      const totalFeedback = positiveItems + negativeItems;
      
      const positivityRatio = totalFeedback > 0 
        ? Math.round((positiveItems / totalFeedback) * 100) 
        : 0;
      
      setFeedbackPositivityRatio({
        current: positivityRatio,
        trend: 'neutral',
        change: 0
      });
    }
  }, [feedbackData]);

  const feedbackStats = feedbackData ? {
    used: feedbackData.filter((item: any) => item.action === 'used').length,
    dismissed: feedbackData.filter((item: any) => item.action === 'dismissed').length
  } : { used: 0, dismissed: 0 };

  return { feedbackPositivityRatio, feedbackStats };
}
