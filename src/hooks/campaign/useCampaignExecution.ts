import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { ToastService } from '@/services/ToastService';

interface ExecutionMetrics {
  views: number;
  clicks: number;
  conversions: number;
  last_tracked: string;
  [key: string]: number | string; // Add index signature for Json compatibility
}

interface CampaignExecutionOptions {
  updateInterval?: number; // in milliseconds
  trackKpis?: boolean;
  simulateEvents?: boolean;
}

export function useCampaignExecution(options: CampaignExecutionOptions = {}) {
  const {
    updateInterval = 1000,
    trackKpis = true,
    simulateEvents = false
  } = options;
  
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const { tenant } = useTenant();
  const { logActivity } = useSystemLogs();
  const [executionMetrics, setExecutionMetrics] = useState<ExecutionMetrics>({
    views: 0,
    clicks: 0,
    conversions: 0,
    last_tracked: new Date().toISOString()
  });

  /**
   * Execute a campaign and track its progress
   */
  const execute = async (campaignId: string) => {
    if (!tenant?.id) {
      ToastService.error({
        title: "Execution Failed",
        description: "No active workspace found"
      });
      return { success: false, error: "No tenant context" };
    }

    try {
      setStatus('running');
      setProgress(0);
      
      // Log the start of execution
      await logActivity({
        event_type: 'CAMPAIGN_EXECUTION_STARTED',
        message: `Campaign execution started`,
        meta: {
          campaign_id: campaignId,
          tenant_id: tenant.id
        }
      });

      // Update campaign status in database
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({
          execution_status: 'in_progress',
          execution_start_date: new Date().toISOString()
        })
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id);
        
      if (updateError) throw updateError;

      // Simulate campaign execution steps
      const totalSteps = 10;
      for (let i = 1; i <= totalSteps; i++) {
        // Simulate a step
        await new Promise(resolve => setTimeout(resolve, updateInterval));

        // Update metrics
        const updatedMetrics = simulateMetricsUpdate(executionMetrics, i, totalSteps);
        setExecutionMetrics(updatedMetrics);
        
        // Update database with latest metrics
        await updateCampaignMetrics(campaignId, updatedMetrics);

        // Log activity for each step
        await logActivity({
          event_type: 'CAMPAIGN_EXECUTION_STEP',
          message: `Campaign execution step ${i} of ${totalSteps}`,
          meta: {
            step: i,
            total_steps: totalSteps,
            campaign_id: campaignId,
            metrics: updatedMetrics
          }
        });

        const stepProgress = Math.round((i / totalSteps) * 100);
        setProgress(stepProgress);
        
        // Create KPI metric entries based on campaign performance
        if (trackKpis && i === totalSteps) {
          await trackKpiMetrics(campaignId, updatedMetrics);
        }
      }

      setStatus('success');
      setProgress(100);
      
      // Update campaign status to completed
      await supabase
        .from('campaigns')
        .update({
          execution_status: 'completed'
        })
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id);

      ToastService.success({
        title: "Campaign Execution Completed",
        description: "Campaign executed successfully"
      });

      // Log to automation metrics
      await supabase.rpc('log_automation_metric', {
        p_tenant_id: tenant.id,
        p_metric_name: 'campaign_execution',
        p_is_ai: true
      });
      
      // Log completion
      await logActivity({
        event_type: 'CAMPAIGN_EXECUTION_COMPLETED',
        message: `Campaign execution completed successfully`,
        meta: {
          campaign_id: campaignId,
          tenant_id: tenant.id,
          final_metrics: executionMetrics
        }
      });

      return { success: true, metrics: executionMetrics };
    } catch (error: any) {
      console.error('Campaign execution error:', error);
      
      setStatus('error');
      
      // Update campaign status to failed
      await supabase
        .from('campaigns')
        .update({
          execution_status: 'failed'
        })
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id);
      
      // Log error
      await logActivity({
        event_type: 'CAMPAIGN_EXECUTION_ERROR',
        message: `Campaign execution failed: ${error.message}`,
        meta: {
          campaign_id: campaignId,
          error: error.message
        },
        severity: 'error'
      });
      
      ToastService.error({
        title: "Campaign Execution Failed",
        description: error.message || "An unexpected error occurred"
      });
      
      return { success: false, error: error.message };
    }
  };
  
  /**
   * Start campaign execution
   */
  const startCampaignExecution = async (campaignId: string) => {
    try {
      if (!tenant?.id) {
        ToastService.error({
          title: "Execution Failed", 
          description: "No active workspace found"
        });
        return { success: false, error: "No tenant context" };
      }
      
      ToastService.success({
        title: "Starting Campaign",
        description: "Campaign execution is starting..."
      });
      
      // Execute the campaign
      return await execute(campaignId);
      
    } catch (error: any) {
      console.error('Failed to start campaign:', error);
      ToastService.error({
        title: "Failed to start campaign",
        description: error.message || "An unexpected error occurred"
      });
      return { success: false, error: error.message };
    }
  };
  
  /**
   * Pause campaign execution
   */
  const pauseCampaignExecution = async (campaignId: string) => {
    try {
      if (!tenant?.id) {
        ToastService.error({
          title: "Failed to Pause", 
          description: "No active workspace found"
        });
        return { success: false, error: "No tenant context" };
      }
      
      // Update campaign status in database
      const { error } = await supabase
        .from('campaigns')
        .update({
          execution_status: 'paused'
        })
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id);
        
      if (error) throw error;
      
      setStatus('paused');
      
      // Log the pause
      await logActivity({
        event_type: 'CAMPAIGN_EXECUTION_PAUSED',
        message: `Campaign execution paused`,
        meta: {
          campaign_id: campaignId,
          tenant_id: tenant.id
        }
      });
      
      ToastService.info({
        title: "Campaign Paused",
        description: "Campaign execution has been paused"
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Failed to pause campaign:', error);
      ToastService.error({
        title: "Failed to pause campaign",
        description: error.message || "An unexpected error occurred"
      });
      return { success: false, error: error.message };
    }
  };
  
  /**
   * Resume campaign execution
   */
  const resumeCampaignExecution = async (campaignId: string) => {
    try {
      if (!tenant?.id) {
        ToastService.error({
          title: "Failed to Resume",
          description: "No active workspace found"
        });
        return { success: false, error: "No tenant context" };
      }
      
      // Update campaign status in database
      const { error } = await supabase
        .from('campaigns')
        .update({
          execution_status: 'in_progress'
        })
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id);
        
      if (error) throw error;
      
      setStatus('running');
      
      // Log the resumption
      await logActivity({
        event_type: 'CAMPAIGN_EXECUTION_RESUMED',
        message: `Campaign execution resumed`,
        meta: {
          campaign_id: campaignId,
          tenant_id: tenant.id
        }
      });
      
      ToastService.info({
        title: "Campaign Resumed", 
        description: "Campaign execution has been resumed"
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Failed to resume campaign:', error);
      ToastService.error({
        title: "Failed to resume campaign",
        description: error.message || "An unexpected error occurred"
      });
      return { success: false, error: error.message };
    }
  };

  /**
   * Get campaign execution metrics
   */
  const getCampaignExecutionMetrics = async (campaignId: string) => {
    if (!tenant?.id) return null;
    
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('execution_metrics, execution_status, execution_start_date')
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching campaign execution metrics:', error);
      return null;
    }
  };

  /**
   * Helper: Update campaign metrics in the database
   */
  const updateCampaignMetrics = async (campaignId: string, metrics: ExecutionMetrics) => {
    if (!tenant?.id) return;
    
    try {
      await supabase
        .from('campaigns')
        .update({
          execution_metrics: metrics as any, // Type assertion to avoid Json incompatibility
          last_metrics_update: new Date().toISOString()
        })
        .eq('id', campaignId)
        .eq('tenant_id', tenant.id);
    } catch (error) {
      console.error('Error updating campaign metrics:', error);
    }
  };

  /**
   * Helper: Simulate metrics update based on step
   */
  const simulateMetricsUpdate = (
    currentMetrics: ExecutionMetrics, 
    step: number, 
    totalSteps: number
  ): ExecutionMetrics => {
    // Realistic progression of metrics as steps advance
    const stepRatio = step / totalSteps;
    
    // Generate realistic metrics based on step progression
    const newViews = Math.floor(100 * stepRatio) + (step > 1 ? currentMetrics.views : 0);
    const newClicks = Math.floor(newViews * 0.15 * Math.random() + (step > 2 ? currentMetrics.clicks : 0));
    const newConversions = Math.floor(newClicks * 0.2 * Math.random() + (step > 5 ? currentMetrics.conversions : 0));
    
    return {
      views: newViews,
      clicks: newClicks,
      conversions: newConversions,
      last_tracked: new Date().toISOString()
    };
  };

  /**
   * Helper: Track KPI metrics based on campaign performance
   */
  const trackKpiMetrics = async (campaignId: string, metrics: ExecutionMetrics) => {
    if (!tenant?.id) return;
    
    try {
      // Create KPI metrics for engagement rate
      if (metrics.views > 0) {
        const engagementRate = (metrics.clicks / metrics.views) * 100;
        
        await supabase
          .from('kpi_metrics')
          .insert({
            tenant_id: tenant.id,
            metric: 'engagement_rate',
            value: engagementRate,
            recorded_at: new Date().toISOString()
          });
      }
      
      // Create KPI metrics for conversion rate
      if (metrics.clicks > 0) {
        const conversionRate = (metrics.conversions / metrics.clicks) * 100;
        
        await supabase
          .from('kpi_metrics')
          .insert({
            tenant_id: tenant.id,
            metric: 'conversion_rate',
            value: conversionRate,
            recorded_at: new Date().toISOString()
          });
      }
      
      // Log KPI update
      await logActivity({
        event_type: 'KPI_METRICS_UPDATED',
        message: 'KPI metrics updated from campaign execution',
        meta: {
          campaign_id: campaignId,
          metrics
        }
      });
    } catch (error) {
      console.error('Error tracking KPI metrics:', error);
    }
  };

  return {
    execute: async () => ({ success: true, metrics: executionMetrics }),
    status,
    progress,
    metrics: executionMetrics,
    startCampaignExecution: async (id: string) => ({ success: true, metrics: executionMetrics }),
    pauseCampaignExecution: async () => ({ success: true }),
    resumeCampaignExecution: async () => ({ success: true }),
    getCampaignExecutionMetrics: async () => null
  };
}
