
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { toast } from "sonner";
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { v4 as uuidv4 } from 'uuid';
import { useAgentCollaboration } from '@/hooks/useAgentCollaboration';

export interface AgentTask {
  taskId: string;
  taskType: string;
  description: string;
  assignedTo: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
}

export function useAgentCollaborationSystem() {
  const [isLoading, setIsLoading] = useState(false);
  const { tenant } = useTenant();
  const { logActivity } = useSystemLogs();
  const { sessionId, logMessage, initializeCollaboration } = useAgentCollaboration();
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  
  const startCollaboration = async (agents: string[], initialPrompt?: string) => {
    if (!tenant?.id) {
      toast(`No active workspace`);
      return null;
    }
    
    setIsLoading(true);
    try {
      const newSessionId = initializeCollaboration();
      
      await logActivity({
        event_type: 'AGENT_COLLABORATION_STARTED',
        message: `Agent collaboration session started with ${agents.join(', ')}`,
        meta: {
          session_id: newSessionId,
          agents
        }
      });
      
      if (initialPrompt && agents.length > 0 && newSessionId) {
        await logMessage(agents[0], initialPrompt);
      }
      
      await supabase.rpc('log_automation_metric', {
        p_tenant_id: tenant.id,
        p_metric_name: 'agent_collaboration_session',
        p_is_ai: true
      });
      
      return newSessionId;
    } catch (error) {
      console.error('Error starting collaboration session:', error);
      toast(`Failed to start agent collaboration`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const addTask = async (
    agentName: string,
    taskType: string,
    description: string
  ) => {
    if (!tenant?.id) return false;
    
    const taskId = uuidv4();
    const newTask: AgentTask = {
      taskId,
      taskType,
      description,
      assignedTo: agentName,
      status: 'pending'
    };
    
    setTasks(prev => [...prev, newTask]);
    
    try {
      await logActivity({
        event_type: 'AGENT_TASK_CREATED',
        message: `Task assigned to ${agentName}: ${taskType}`,
        meta: {
          task_id: taskId,
          agent: agentName,
          task_type: taskType,
          description
        }
      });
      
      if (sessionId && logMessage) {
        await logMessage('System', `Task assigned to ${agentName}: ${description}`);
      }
      
      return taskId;
    } catch (error) {
      console.error('Error adding task:', error);
      return false;
    }
  };
  
  const updateTaskStatus = async (
    taskId: string,
    status: 'pending' | 'in_progress' | 'completed' | 'failed',
    result?: any
  ) => {
    setTasks(prev => prev.map(task => 
      task.taskId === taskId 
        ? { ...task, status, result } 
        : task
    ));
    
    try {
      const task = tasks.find(t => t.taskId === taskId);
      if (!task) return false;
      
      await logActivity({
        event_type: 'AGENT_TASK_UPDATED',
        message: `Task ${taskId} status updated to ${status}`,
        meta: {
          task_id: taskId,
          agent: task.assignedTo,
          task_type: task.taskType,
          previous_status: task.status,
          new_status: status,
          result
        }
      });
      
      if (sessionId && logMessage) {
        const message = status === 'completed'
          ? `Task completed by ${task.assignedTo}: ${task.description}`
          : status === 'failed'
            ? `Task failed by ${task.assignedTo}: ${task.description}`
            : `Task status updated to ${status} for ${task.assignedTo}`;
            
        await logMessage('System', message);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating task status:', error);
      return false;
    }
  };
  
  const endCollaboration = async (summary?: string) => {
    if (!tenant?.id || !sessionId || !logMessage) return false;
    
    try {
      if (summary) {
        await logMessage('System', `Collaboration summary: ${summary}`);
      }
      
      await logActivity({
        event_type: 'AGENT_COLLABORATION_ENDED',
        message: 'Agent collaboration session ended',
        meta: {
          session_id: sessionId,
          tasks_count: tasks.length,
          completed_tasks: tasks.filter(t => t.status === 'completed').length,
          failed_tasks: tasks.filter(t => t.status === 'failed').length
        }
      });
      
      setTasks([]);
      
      return true;
    } catch (error) {
      console.error('Error ending collaboration session:', error);
      return false;
    }
  };
  
  return {
    isLoading,
    sessionId,
    tasks,
    startCollaboration,
    addTask,
    updateTaskStatus,
    endCollaboration
  };
}
