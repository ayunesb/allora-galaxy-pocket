
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { useSystemLogs } from '@/hooks/useSystemLogs';

/**
 * Hook to register and manage automation triggers
 */
export function useAutomationTriggers() {
  const { tenant } = useTenant();
  const { logActivity } = useSystemLogs();
  
  // Register automation for KPI metrics tracking
  useEffect(() => {
    if (!tenant?.id) return;
    
    const triggerKpiMetricAutomation = async () => {
      try {
        // Log that the automation trigger was registered
        await supabase.from('system_logs').insert({
          tenant_id: tenant.id,
          event_type: 'AUTOMATION_TRIGGER_REGISTERED',
          message: 'KPI metrics automation trigger registered',
          meta: { 
            automation_type: 'kpi_metrics',
            trigger_type: 'system'
          }
        });
        
        // Log to automation metrics
        await supabase.rpc('log_automation_metric', {
          p_tenant_id: tenant.id,
          p_metric_name: 'kpi_trigger_registration',
          p_is_ai: true
        });
      } catch (error) {
        console.error("Failed to register KPI automation trigger:", error);
      }
    };
    
    triggerKpiMetricAutomation();
    
    // Set up channel subscription for realtime updates on KPI metrics
    const channel = supabase
      .channel('kpi-metrics-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'kpi_metrics',
          filter: `tenant_id=eq.${tenant.id}`
        },
        (payload) => {
          logActivity({
            event_type: 'KPI_METRIC_INSERTED',
            message: `New KPI metric recorded: ${payload.new.metric}`,
            meta: {
              metric: payload.new.metric,
              value: payload.new.value
            }
          });
          
          // Trigger automation based on KPI metric
          if (payload.new.metric === 'mql' || payload.new.metric === 'conversion_rate') {
            triggerKpiAnalysis(payload.new.metric, payload.new.value);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenant?.id]);
  
  // Register automation for system health monitoring
  useEffect(() => {
    if (!tenant?.id) return;
    
    const checkSystemHealth = async () => {
      // Log automation trigger
      await supabase.from('system_logs').insert({
        tenant_id: tenant.id,
        event_type: 'AUTOMATION_TRIGGER_REGISTERED',
        message: 'System health automation trigger registered',
        meta: { 
          automation_type: 'system_health',
          trigger_type: 'scheduled'
        }
      });
      
      // Log to automation metrics
      await supabase.rpc('log_automation_metric', {
        p_tenant_id: tenant.id,
        p_metric_name: 'system_health_check',
        p_is_ai: true
      });
    };
    
    checkSystemHealth();
    
    // In a real implementation, we'd set up a scheduled check here
    const interval = setInterval(checkSystemHealth, 24 * 60 * 60 * 1000); // Once per day
    
    return () => clearInterval(interval);
  }, [tenant?.id]);
  
  const triggerKpiAnalysis = async (metric: string, value: number) => {
    if (!tenant?.id) return;
    
    try {
      // Get previous metrics for comparison
      const { data: previousMetrics } = await supabase
        .from('kpi_metrics')
        .select('value')
        .eq('tenant_id', tenant.id)
        .eq('metric', metric)
        .order('recorded_at', { ascending: false })
        .limit(2);
      
      if (previousMetrics && previousMetrics.length > 1) {
        const currentValue = value;
        const previousValue = previousMetrics[1].value;
        const percentageChange = ((currentValue - previousValue) / previousValue) * 100;
        
        // If significant change, trigger alert or analysis
        if (Math.abs(percentageChange) > 10) {
          // Log significant KPI change
          await logActivity({
            event_type: 'KPI_SIGNIFICANT_CHANGE',
            message: `Significant change detected in ${metric}: ${percentageChange.toFixed(1)}%`,
            meta: {
              metric,
              current_value: currentValue,
              previous_value: previousValue,
              percentage_change: percentageChange
            }
          });
          
          // Trigger AI analysis
          if (percentageChange < -10) {
            // Negative change - trigger recovery strategy suggestion
            await supabase.functions.invoke('generate-recovery-plan', {
              body: {
                tenant_id: tenant.id,
                metric,
                current_value: currentValue,
                previous_value: previousValue,
                percentage_change: percentageChange
              }
            });
          }
          
          // Log to automation metrics
          await supabase.rpc('log_automation_metric', {
            p_tenant_id: tenant.id,
            p_metric_name: 'kpi_analysis_triggered',
            p_is_ai: true
          });
        }
      }
    } catch (error) {
      console.error("Failed to analyze KPI metrics:", error);
    }
  };
  
  /**
   * Trigger an automation process
   */
  const triggerAutomation = async (type: string, payload: any) => {
    if (!tenant?.id) return false;
    
    try {
      // Log the automation trigger
      await logActivity({
        event_type: 'AUTOMATION_TRIGGERED',
        message: `Automation triggered: ${type}`,
        meta: {
          automation_type: type,
          payload
        }
      });
      
      // Log to automation metrics
      await supabase.rpc('log_automation_metric', {
        p_tenant_id: tenant.id,
        p_metric_name: `automation_${type}`,
        p_is_ai: true
      });
      
      // Add specific automation handling based on type
      switch (type) {
        case 'campaign_optimization':
          // Invoke campaign optimization edge function
          await supabase.functions.invoke('predict-campaign-performance', {
            body: {
              tenant_id: tenant.id,
              campaign_id: payload.campaignId
            }
          });
          break;
          
        case 'strategy_suggestion':
          // Invoke strategy suggestion edge function
          await supabase.functions.invoke('strategy-auto-gen', {
            body: {
              tenant_id: tenant.id,
              industry: payload.industry,
              goal: payload.goal
            }
          });
          break;
          
        default:
          console.log(`No handler for automation type: ${type}`);
          return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to trigger automation (${type}):`, error);
      return false;
    }
  };
  
  return {
    triggerAutomation
  };
}
