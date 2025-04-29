
import { supabase } from '@/integrations/supabase/client';
import { ToastService } from '@/services/ToastService';

export interface AgentTask {
  id?: string;
  tenant_id: string;
  agent_name: string;
  task_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payload: any;
  created_at?: string;
  completed_at?: string;
  error_message?: string;
  result?: any;
}

export async function dispatchAgentTask(task: Omit<AgentTask, 'id' | 'created_at' | 'status'>) {
  try {
    // Create the task in the database
    const taskRecord = {
      ...task,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
    };

    // Log to system_logs instead of trying to use agent_tasks table which might not exist
    try {
      const { data: logData, error: logError } = await supabase
        .from('system_logs')
        .insert({
          tenant_id: task.tenant_id,
          event_type: 'AGENT_TASK',
          message: `Task for ${task.agent_name}: ${task.task_type}`,
          meta: {
            task: taskRecord
          },
          severity: 'info'
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
    // Since we're storing in system_logs now, let's query those instead
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('event_type', 'AGENT_TASK')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Extract tasks from log metadata
    const tasks = data.map(log => ({
      id: log.id,
      ...log.meta?.task,
    })).filter(task => task.status === 'pending');
    
    return { success: true, tasks };
  } catch (error: any) {
    console.error('Error getting pending tasks:', error);
    return { success: false, error, tasks: [] };
  }
}
