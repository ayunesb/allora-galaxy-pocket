
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
        
        // Transform to AgentStats format with proper type handling and defaults
        const agentStats: AgentStats[] = (data || []).map(log => {
          // Safely extract values with defaults
          const metrics = log.metrics as Record<string, any> | null;
          const totalTasks = metrics && typeof metrics === 'object' && 'total_tasks' in metrics ? 
            Number(metrics.total_tasks) || 0 : 0;
          const avgExecutionTime = metrics && typeof metrics === 'object' && 'avg_execution_time' in metrics ? 
            Number(metrics.avg_execution_time) || 0 : 0;
            
          return {
            agentName: log.agent_name || 'Unknown',
            totalTasks,
            successRate: typeof log.success_rate === 'number' ? log.success_rate : 0,
            averageExecutionTime: avgExecutionTime,
            lastExecuted: log.created_at || new Date().toISOString()
          };
        });
        
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
