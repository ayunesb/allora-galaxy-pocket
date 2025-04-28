
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AgentStats {
  agentName: string;
  totalTasks: number;
  successRate: number;
  averageExecutionTime: number;
  lastExecuted: string;
}

export function useAgentStats() {
  const [stats, setStats] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAgentStats = async () => {
      setLoading(true);
      try {
        // Use agent_performance_logs table which should exist in the database
        const { data, error: apiError } = await supabase
          .from('agent_performance_logs')
          .select('*');
        
        if (apiError) throw apiError;
        
        // Transform to AgentStats format
        const agentStats: AgentStats[] = (data || []).map(log => ({
          agentName: log.agent_name,
          totalTasks: log.metrics?.total_tasks || 0,
          successRate: log.success_rate || 0,
          averageExecutionTime: log.metrics?.avg_execution_time || 0,
          lastExecuted: log.created_at
        }));
        
        setStats(agentStats);
      } catch (err) {
        console.error('Error fetching agent stats:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch agent statistics'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgentStats();
  }, []);

  return { stats, loading, error };
}
