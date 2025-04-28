
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AgentTask } from '@/types/agent';

interface AgentHealthCheck {
  agent: string;
  status: 'healthy' | 'warning' | 'error';
  lastTask?: AgentTask;
  errorCount: number;
  successCount: number;
}

export default function AgentHealthMonitor() {
  const [healthChecks, setHealthChecks] = useState<AgentHealthCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAgentHealth = async () => {
      setIsLoading(true);
      try {
        // Get all agent names
        const { data: agents } = await supabase
          .from('agent_profiles')
          .select('agent_name');
        
        if (!agents || agents.length === 0) {
          setHealthChecks([]);
          return;
        }
        
        const healthData: AgentHealthCheck[] = [];
        
        // For each agent, get their recent tasks
        for (const agent of agents) {
          const agentName = agent.agent_name;
          
          // Query for tasks table, which could be agent_tasks
          const { data: tasks, error } = await supabase
            .from('assistant_logs') // Using assistant_logs as a fallback
            .select('*')
            .eq('agent_name', agentName)
            .order('created_at', { ascending: false })
            .limit(10);
            
          if (error) {
            console.error(`Error fetching tasks for agent ${agentName}:`, error);
            continue;
          }
          
          const successCount = tasks?.filter(t => t.feedback_type === 'positive').length || 0;
          const errorCount = tasks?.filter(t => t.feedback_type === 'negative').length || 0;
          
          // Determine health status
          let status: 'healthy' | 'warning' | 'error' = 'healthy';
          if (errorCount > 3) {
            status = 'error';
          } else if (errorCount > 1) {
            status = 'warning';
          }
          
          healthData.push({
            agent: agentName,
            status,
            lastTask: tasks && tasks.length > 0 ? tasks[0] as unknown as AgentTask : undefined,
            errorCount,
            successCount
          });
        }
        
        setHealthChecks(healthData);
      } catch (err) {
        console.error('Error checking agent health:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAgentHealth();
    
    // Set up a refresh interval
    const interval = setInterval(checkAgentHealth, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Agent Health Status</h3>
      
      {isLoading ? (
        <div className="text-center py-4">
          <span className="loading loading-spinner"></span>
          <p className="text-sm text-muted-foreground">Checking agent health...</p>
        </div>
      ) : healthChecks.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">No agents found</p>
      ) : (
        <div className="space-y-2">
          {healthChecks.map((check) => (
            <div 
              key={check.agent}
              className={`border rounded-md p-3 ${
                check.status === 'error' ? 'border-red-500 bg-red-50' :
                check.status === 'warning' ? 'border-amber-500 bg-amber-50' :
                'border-green-500 bg-green-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{check.agent}</h4>
                  <p className="text-sm text-muted-foreground">
                    {check.successCount} successes, {check.errorCount} errors
                  </p>
                </div>
                <div className={`px-2 py-1 text-xs rounded ${
                  check.status === 'error' ? 'bg-red-200 text-red-800' :
                  check.status === 'warning' ? 'bg-amber-200 text-amber-800' :
                  'bg-green-200 text-green-800'
                }`}>
                  {check.status.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
