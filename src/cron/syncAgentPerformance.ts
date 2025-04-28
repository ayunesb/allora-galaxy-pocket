
import { supabase } from "@/integrations/supabase/client";

export async function syncAgentPerformance() {
  try {
    // Get all tenants with active strategies
    const { data: tenants, error: tenantError } = await supabase
      .from("tenant_profiles")
      .select("id")
      .eq("is_demo", false);
      
    if (tenantError) throw tenantError;
    
    for (const tenant of tenants) {
      await processTenantPerformance(tenant.id);
    }
    
    return { success: true, message: "Agent performance sync completed" };
  } catch (error) {
    console.error("Error syncing agent performance:", error);
    
    await supabase.from("system_logs").insert({
      event_type: "AGENT_PERFORMANCE_SYNC_ERROR",
      message: "Failed to sync agent performance",
      meta: { error: String(error) },
      tenant_id: null // System-wide error
    });
    
    return { success: false, error: String(error) };
  }
}

async function processTenantPerformance(tenantId: string) {
  try {
    // Get strategies with campaigns from the last 30 days
    const { data: strategies, error: strategyError } = await supabase
      .from("strategies")
      .select(`
        id, 
        title, 
        generated_by,
        campaigns (
          id,
          execution_metrics,
          execution_status
        )
      `)
      .eq("tenant_id", tenantId)
      .eq("status", "approved")
      .gt("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
    if (strategyError) throw strategyError;
    
    // Process each strategy with campaigns
    for (const strategy of strategies) {
      if (!strategy.campaigns || strategy.campaigns.length === 0) continue;
      
      const agentName = strategy.generated_by || "CEO";
      let successRate = 0;
      let feedbackScore = 0;
      let hasValidMetrics = false;
      
      // Calculate performance metrics based on campaign execution
      const campaigns = strategy.campaigns as any[];
      const completedCampaigns = campaigns.filter(c => 
        c.execution_status === "completed" || c.execution_status === "successful"
      );
      
      if (completedCampaigns.length > 0) {
        // Success rate based on completed campaigns
        successRate = (completedCampaigns.length / campaigns.length) * 100;
        
        // Calculate feedback score from campaign metrics (if available)
        let totalConversions = 0;
        let totalViews = 0;
        
        for (const campaign of completedCampaigns) {
          if (campaign.execution_metrics) {
            const { conversions, views } = campaign.execution_metrics;
            if (typeof conversions === 'number' && typeof views === 'number' && views > 0) {
              totalConversions += conversions;
              totalViews += views;
              hasValidMetrics = true;
            }
          }
        }
        
        if (hasValidMetrics && totalViews > 0) {
          feedbackScore = (totalConversions / totalViews) * 100;
        } else {
          feedbackScore = 50; // Default score when metrics aren't available
        }
        
        // Log the performance
        await supabase.from("agent_performance_logs").insert({
          tenant_id: tenantId,
          strategy_id: strategy.id,
          agent_name: agentName,
          success_rate: successRate,
          feedback_score: feedbackScore,
          notes: `Performance analysis for strategy: ${strategy.title}`,
          metrics: {
            completed_campaigns: completedCampaigns.length,
            total_campaigns: campaigns.length,
            conversions: totalConversions,
            views: totalViews
          }
        });
        
        // If performance is poor, create a suggestion for improvement
        if (feedbackScore < 30 || successRate < 50) {
          await supabase.from("agent_memory").insert({
            tenant_id: tenantId,
            agent_name: agentName,
            context: `Performance analysis indicates strategy "${strategy.title}" is underperforming. Consider revising the approach or targeting.`,
            type: "feedback",
            xp_delta: -2
          });
        }
        
        // If performance is good, reinforce the learning
        if (feedbackScore > 70 && successRate > 80) {
          await supabase.from("agent_memory").insert({
            tenant_id: tenantId,
            agent_name: agentName,
            context: `Strategy "${strategy.title}" is performing exceptionally well. Key success factors should be applied to future strategies.`,
            type: "feedback",
            xp_delta: 5
          });
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error processing tenant ${tenantId} performance:`, error);
    
    await supabase.from("system_logs").insert({
      event_type: "TENANT_PERFORMANCE_SYNC_ERROR",
      message: `Failed to sync performance for tenant ${tenantId}`,
      meta: { error: String(error) },
      tenant_id: tenantId
    });
    
    return false;
  }
}

// This function can be called by a Supabase Edge Function on a schedule
export default syncAgentPerformance;
