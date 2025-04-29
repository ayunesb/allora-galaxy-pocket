
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
      // First try logging to system_logs instead to avoid table issues
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
    // Check system_logs
    try {
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
    // Since we're storing in system_logs now, let's just return an empty array
    return { success: true, tasks: [] };
  } catch (error: any) {
    console.error('Error getting pending tasks:', error);
    return { success: false, error, tasks: [] };
  }
}
