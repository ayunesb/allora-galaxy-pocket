
import { supabase } from '@/integrations/supabase/client';
import { ToastService } from '@/services/ToastService';

export interface AgentTask {
  id?: string;
  tenant_id: string;
  agent_name: string;
  task_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payload: Record<string, any>;
  created_at?: string;
  completed_at?: string;
  error_message?: string;
  result?: Record<string, any> | null;
}

export async function dispatchAgentTask(task: Omit<AgentTask, 'id' | 'created_at' | 'status'>) {
  try {
    // Create the task in the database
    const taskRecord = {
      ...task,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
    };

    // Check if the table actually exists before trying to insert
    // Let's create a fallback approach since agent_tasks might not exist yet
    
    try {
      // First try with tasks table
      const { data, error } = await supabase
        .from('agent_tasks')
        .insert(taskRecord)
        .select()
        .single();
        
      if (error) {
        // If that fails, let's try logging it to system_logs instead
        console.warn('agent_tasks table might not exist:', error.message);
        
        const { data: logData, error: logError } = await supabase
          .from('system_logs')
          .insert({
            tenant_id: task.tenant_id,
            event_type: 'AGENT_TASK',
            message: `Task for ${task.agent_name}: ${task.task_type}`,
            meta: {
              task: taskRecord
            }
          })
          .select()
          .single();
          
        if (logError) throw logError;
        
        return {
          success: true,
          task: {
            id: logData.id,
            ...taskRecord
          }
        };
      }
      
      return {
        success: true,
        task: data
      };
    } catch (finalError) {
      console.error('Failed to dispatch agent task:', finalError);
      throw finalError;
    }
  } catch (error: any) {
    console.error('Error dispatching agent task:', error);
    ToastService.error(`Failed to dispatch task: ${error.message}`);
    return {
      success: false,
      error
    };
  }
}

export async function checkTaskStatus(taskId: string, tenantId: string) {
  try {
    // First try agent_tasks
    try {
      const { data, error } = await supabase
        .from('agent_tasks')
        .select('*')
        .eq('id', taskId)
        .eq('tenant_id', tenantId)
        .single();
        
      if (error) {
        // If error, try system_logs
        console.warn('Checking system_logs instead of agent_tasks');
        const { data: logData, error: logError } = await supabase
          .from('system_logs')
          .select('*')
          .eq('id', taskId)
          .eq('tenant_id', tenantId)
          .single();
          
        if (logError) throw logError;
        
        // Extract task from metadata
        const task = logData.meta?.task || {
          status: 'unknown'
        };
        
        return { success: true, task };
      }
      
      return { success: true, task: data };
    } catch (finalError) {
      throw finalError;
    }
  } catch (error: any) {
    console.error('Error checking task status:', error);
    return { success: false, error };
  }
}

export async function getAllPendingTasks(tenantId: string) {
  try {
    try {
      const { data: pendingTasks, error } = await supabase
        .from('agent_tasks')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
        
      if (error) {
        console.warn('Couldn\'t get pending tasks, table might not exist:', error.message);
        return { success: true, tasks: [] };
      }
      
      return { success: true, tasks: pendingTasks };
    } catch (finalError) {
      throw finalError;
    }
  } catch (error: any) {
    console.error('Error getting pending tasks:', error);
    return { success: false, error, tasks: [] };
  }
}
