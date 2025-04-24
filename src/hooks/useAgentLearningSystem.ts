
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';
import { useToast } from './use-toast';
import { useSystemLogs } from './useSystemLogs';

export function useAgentLearningSystem() {
  const [isLoading, setIsLoading] = useState(false);
  const { tenant } = useTenant();
  const { toast } = useToast();
  const { logActivity } = useSystemLogs();

  const analyzeAgentPerformance = async (agentName: string) => {
    if (!tenant?.id) return null;
    
    setIsLoading(true);
    try {
      // Get agent memories
      const { data: memories, error: memoriesError } = await supabase
        .from('agent_memory')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('agent_name', agentName)
        .order('timestamp', { ascending: false })
        .limit(100);
        
      if (memoriesError) throw memoriesError;
      
      // Get agent tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('agent_tasks')
        .select('*')
        .eq('agent', agentName)
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (tasksError) throw tasksError;
      
      // Calculate performance metrics
      const totalTasks = tasks?.length || 0;
      const successfulTasks = tasks?.filter(t => t.status === 'success').length || 0;
      const successRate = totalTasks > 0 ? (successfulTasks / totalTasks) * 100 : 0;
      
      // Calculate memory stats
      const userSubmittedMemories = memories?.filter(m => m.is_user_submitted).length || 0;
      const highRatedMemories = memories?.filter(m => (m.ai_rating || 0) > 3).length || 0;
      const remixedMemories = memories?.filter(m => (m.remix_count || 0) > 0).length || 0;
      const totalXP = memories?.reduce((sum, m) => sum + (m.xp_delta || 0), 0) || 0;
      
      const performance = {
        totalTasks,
        successfulTasks,
        successRate,
        userSubmittedMemories,
        highRatedMemories,
        remixedMemories,
        totalXP,
        lastAnalyzed: new Date().toISOString()
      };
      
      // Save performance analysis
      await supabase
        .from('agent_profiles')
        .update({
          memory_score: Math.min(Math.round(successRate + (totalXP / 10)), 100),
          performance_metrics: performance
        })
        .eq('tenant_id', tenant.id)
        .eq('agent_name', agentName);
      
      await logActivity({
        event_type: 'agent_analysis_complete',
        message: `Performance analysis completed for ${agentName}`,
        meta: { agent: agentName, performance }
      });
      
      return performance;
    } catch (error) {
      console.error('Error analyzing agent performance:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze agent performance',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const learnFromFeedback = async (agentName: string, memory: any) => {
    if (!tenant?.id || !memory) return false;
    
    setIsLoading(true);
    try {
      // Calculate XP based on user feedback
      let xpDelta = 0;
      
      if (memory.is_user_submitted) {
        xpDelta += 10; // User submitted content is valuable
      }
      
      if (memory.remix_count && memory.remix_count > 0) {
        xpDelta += memory.remix_count * 5; // Frequently reused content is valuable
      }
      
      if (memory.ai_rating) {
        xpDelta += (memory.ai_rating - 3) * 5; // AI ratings above 3 are positive
      }
      
      // Update memory with XP
      const { error } = await supabase
        .from('agent_memory')
        .update({ 
          xp_delta: xpDelta,
          analyzed: true
        })
        .eq('id', memory.id)
        .eq('tenant_id', tenant.id);
        
      if (error) throw error;
      
      // Log learning activity
      await logActivity({
        event_type: 'agent_learning',
        message: `${agentName} learned from feedback and gained ${xpDelta} XP`,
        meta: { 
          agent: agentName, 
          memory_id: memory.id,
          xp_delta: xpDelta
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error in agent learning:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const improveAgentPrompt = async (agentName: string, currentPrompt: string) => {
    if (!tenant?.id || !currentPrompt) return null;
    
    setIsLoading(true);
    try {
      // Get high-rated memories to learn from
      const { data: topMemories, error: memoriesError } = await supabase
        .from('agent_memory')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('agent_name', agentName)
        .gte('ai_rating', 4)
        .order('ai_rating', { ascending: false })
        .limit(10);
        
      if (memoriesError) throw memoriesError;
      
      if (!topMemories || topMemories.length === 0) {
        // Not enough data to improve prompt
        return currentPrompt;
      }
      
      // In a real implementation, we would call an AI endpoint
      // to improve the prompt based on the best memories
      // For now, we'll just append learning insights
      const learningInsights = topMemories
        .map(m => `- ${m.context.substring(0, 50)}...`)
        .join('\n');
      
      const improvedPrompt = `${currentPrompt}\n\n/* Learning insights:\n${learningInsights}\n*/`;
      
      // Save improved prompt as a new version
      const { data: version, error } = await supabase
        .from('agent_prompt_versions')
        .insert({
          tenant_id: tenant.id,
          agent_name: agentName,
          prompt: improvedPrompt,
          improvement_source: 'memory_analysis',
          previous_version_id: null // In a real implementation, store the previous version ID
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Log prompt improvement
      await logActivity({
        event_type: 'agent_prompt_improved',
        message: `${agentName}'s prompt was automatically improved based on memory analysis`,
        meta: { 
          agent: agentName, 
          version_id: version.id
        }
      });
      
      return improvedPrompt;
    } catch (error) {
      console.error('Error improving agent prompt:', error);
      toast({
        title: 'Prompt Improvement Failed',
        description: 'Could not improve agent prompt',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    analyzeAgentPerformance,
    learnFromFeedback,
    improveAgentPrompt
  };
}
