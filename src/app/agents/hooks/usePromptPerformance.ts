
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PromptPerformanceData } from '@/types/agent';

export function usePromptPerformance(agentName: string) {
  const [performanceData, setPerformanceData] = useState<PromptPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      setLoading(true);
      try {
        // Use agent_prompt_versions table which should exist
        const { data, error: apiError } = await supabase
          .from('agent_prompt_versions')
          .select('*')
          .eq('agent_name', agentName)
          .order('version', { ascending: false });
          
        if (apiError) throw apiError;
        
        // Transform to expected format
        const transformedData: PromptPerformanceData[] = (data || []).map(item => ({
          agent_name: item.agent_name,
          version: item.version,
          success_rate: 90, // Default value as this might come from analytics
          upvotes: 10, // Default value 
          downvotes: 1, // Default value
          total_executions: 20, // Default value
          last_executed: item.created_at
        }));
        
        setPerformanceData(transformedData);
      } catch (err) {
        console.error('Error fetching prompt performance:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch performance data'));
      } finally {
        setLoading(false);
      }
    };
    
    if (agentName) {
      fetchPerformanceData();
    }
  }, [agentName]);

  return { performanceData, loading, error };
}
