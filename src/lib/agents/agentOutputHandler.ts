
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

interface AgentOutput {
  agentName: string;
  taskType: string;
  title: string;
  description: string;
  data: any;
  kpis?: string[];
}

/**
 * Links agent output to strategies and KPI metrics
 * @param output The agent output to store
 * @returns The ID of the created strategy
 */
export async function storeAgentOutput(output: AgentOutput): Promise<string | null> {
  try {
    const isPublic = false; // Default to private
    const tenant_id = localStorage.getItem('currentTenantId');
    
    console.log(`[storeAgentOutput] Storing output from ${output.agentName} agent`);
    
    // Generate impact score based on data complexity (this would be more sophisticated in production)
    const impactScore = generateImpactScore(output.data);
    
    // 1. Store the strategy
    const strategyId = uuidv4();
    const { error: strategyError } = await supabase
      .from('strategies')
      .insert({
        id: strategyId,
        title: output.title,
        description: output.description,
        tenant_id,
        tags: [output.agentName, output.taskType],
        is_public: isPublic,
        impact_score: impactScore,
        status: 'active'
      });
      
    if (strategyError) {
      console.error('[storeAgentOutput] Error storing strategy:', strategyError);
      return null;
    }
    
    // 2. Log to system logs
    await supabase
      .from('system_logs')
      .insert({
        tenant_id,
        event_type: `${output.agentName}_strategy_created`,
        message: `New ${output.agentName} strategy created: ${output.title}`,
        meta: { strategyId, taskType: output.taskType }
      });
      
    // 3. Link to KPI metrics if provided
    if (output.kpis && output.kpis.length > 0) {
      for (const kpi of output.kpis) {
        await supabase
          .from('kpi_metrics')
          .insert({
            tenant_id,
            metric: kpi,
            value: impactScore / 20, // Simplified value calculation
            recorded_at: new Date().toISOString()
          });
      }
    }
    
    console.log(`[storeAgentOutput] Successfully stored agent output with ID: ${strategyId}`);
    return strategyId;
    
  } catch (error) {
    console.error('[storeAgentOutput] Unexpected error:', error);
    return null;
  }
}

/**
 * Generates an impact score based on the agent output
 * This is a simplified version, you would use more sophisticated logic in production
 */
function generateImpactScore(data: any): number {
  try {
    // Basic algorithm to determine impact score
    const strData = JSON.stringify(data);
    const complexity = strData.length;
    const structureFactor = Object.keys(data).length * 5;
    
    // Calculate score based on complexity and structure (0-100)
    let score = Math.min(100, Math.max(10, (complexity / 500) + structureFactor));
    
    // Round to nearest integer
    return Math.round(score);
  } catch (error) {
    console.error('[generateImpactScore] Error calculating impact score:', error);
    return 50; // Default score
  }
}

/**
 * Creates a shareable version of a strategy
 */
export async function shareStrategy(strategyId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('strategies')
      .update({ is_public: true })
      .eq('id', strategyId);
      
    return !error;
  } catch (error) {
    console.error('[shareStrategy] Error sharing strategy:', error);
    return false;
  }
}

/**
 * Get link to view a stored strategy
 */
export function getStrategyLink(strategyId: string): string {
  return `/vault/strategy-detail/${strategyId}`;
}
