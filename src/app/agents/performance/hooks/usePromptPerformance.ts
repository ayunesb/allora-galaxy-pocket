
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PromptPerformanceData } from '@/types/agent';

export function usePromptPerformance(agentName?: string) {
  const [performanceData, setPerformanceData] = useState<PromptPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPromptPerformance = async () => {
      setLoading(true);
      try {
        // Fetch prompt performance data from the database
        const { data, error: apiError } = await supabase
          .from('agent_prompt_versions')
          .select(`
            version,
            agent_name,
            created_at,
            agent_prompt_votes (
              vote
            )
          `)
          .eq(agentName ? 'agent_name' : 'agent_name', agentName || '');
        
        if (apiError) throw apiError;
        
        // Transform the data to match the PromptPerformanceData interface
        const formattedData: PromptPerformanceData[] = (data || []).map(item => {
          const votes = Array.isArray(item.agent_prompt_votes) ? item.agent_prompt_votes : [];
          const upvotes = votes.filter(v => v.vote > 0).length;
          const downvotes = votes.filter(v => v.vote < 0).length;
          const totalVotes = upvotes + downvotes;
          
          return {
            agent_name: item.agent_name,
            version: item.version,
            success_rate: totalVotes > 0 ? (upvotes / totalVotes) * 100 : 0,
            upvotes,
            downvotes,
            total_executions: votes.length,
            last_executed: item.created_at
          };
        });
        
        setPerformanceData(formattedData);
      } catch (err) {
        console.error('Error fetching prompt performance:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch prompt performance data'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchPromptPerformance();
  }, [agentName]);

  return { performanceData, loading, error, isLoading: loading };
}

export function generatePromptRecommendations(performanceData: PromptPerformanceData[]) {
  // Implementation for prompt recommendations
  const recommendations: string[] = [];
  
  if (!performanceData.length) {
    recommendations.push("No performance data available yet to generate recommendations.");
    return recommendations;
  }
  
  const lowPerformers = performanceData.filter(p => p.success_rate < 50);
  if (lowPerformers.length > 0) {
    recommendations.push(`Consider revising prompts for ${lowPerformers.map(p => p.agent_name).join(', ')}.`);
  }
  
  const highPerformers = performanceData.filter(p => p.success_rate > 80);
  if (highPerformers.length > 0) {
    recommendations.push(`Strong performing prompts: ${highPerformers.map(p => p.agent_name).join(', ')}.`);
  }
  
  return recommendations;
}
