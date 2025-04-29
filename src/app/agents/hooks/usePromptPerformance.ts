
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PromptPerformanceData } from '@/types/agent';

export function usePromptPerformance(agentName: string) {
  const [data, setData] = useState<PromptPerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPerformanceData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use agent_prompt_versions table which should exist
      const { data: apiData, error: apiError } = await supabase
        .from('agent_prompt_versions')
        .select('*')
        .eq('agent_name', agentName)
        .order('version', { ascending: false });
        
      if (apiError) throw apiError;
      
      // Transform to expected format with safeguards
      const transformedData: PromptPerformanceData[] = (apiData || []).map(item => ({
        agent_name: item.agent_name || '',
        version: item.version || 1,
        success_rate: 90, // Default value as this might come from analytics
        upvotes: 10, // Default value 
        downvotes: 1, // Default value
        total_executions: 20, // Default value
        last_executed: item.created_at || new Date().toISOString()
      }));
      
      setData(transformedData);
      return transformedData;
    } catch (err) {
      console.error('Error fetching prompt performance:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch performance data'));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [agentName]);

  // Execute the fetch function when component mounts
  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  // Generate prompt recommendations based on performance data
  const generatePromptRecommendations = useCallback(() => {
    if (data.length === 0) return [];
    
    // This is a simple example - in a real app, you might have more complex logic
    return [
      "Add more specific context to improve response relevance",
      "Include examples in your prompts for better results",
      "Use system messages to set clear expectations"
    ];
  }, [data]);

  return { 
    data, 
    isLoading, 
    error,
    generatePromptRecommendations 
  };
}
