
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCreditsManager } from "@/hooks/useCreditsManager";
import { logAgentMemory } from "./memoryLogger";

type AgentTask = {
  agent: string;
  task_type: string;
  payload: any;
  tenant_id?: string;
};

type TaskExecutionResult = {
  success: boolean;
  result?: any;
  error?: string;
  xp_delta?: number;
};

export const executeAgentTask = async (task: AgentTask): Promise<TaskExecutionResult> => {
  try {
    // Instead of using agent_tasks table which doesn't exist
    // Log task to agent_memory table which we know exists
    const { data: taskRecord, error: logError } = await supabase.from("agent_memory").insert({
      agent_name: task.agent,
      context: `Task execution: ${task.task_type}`,
      type: "task",
      tenant_id: task.tenant_id,
      metadata: task.payload,
      created_at: new Date().toISOString()
    }).select().single();
    
    if (logError) {
      console.error("Error logging agent task:", logError);
    }
    
    // Call the dispatch-agent-task edge function
    const { data, error } = await supabase.functions.invoke("dispatch-agent-task", {
      body: {
        user_id: (await supabase.auth.getUser()).data?.user?.id,
        agent: task.agent,
        task_type: task.task_type,
        payload: task.payload,
        task_id: taskRecord?.id
      }
    });
    
    if (error) {
      throw new Error(`Task execution failed: ${error.message}`);
    }
    
    // Handle "blocked" status (permission issue)
    if (data?.status === "blocked") {
      return {
        success: false,
        error: "Permission denied. Your account doesn't have access to this feature."
      };
    }
    
    // Calculate XP based on task complexity and outcome
    const xp_delta = calculateTaskXP(task.task_type, data?.complexity || 'normal', true);
    
    // Log task completion to agent_memory
    if (task.tenant_id) {
      await supabase.from("agent_memory").update({
        context: `Successfully executed ${task.task_type} task`,
        metadata: { ...task.payload, result: data }
      }).eq("id", taskRecord?.id);
    
      // Log to agent memory for learning
      await logAgentMemory({
        tenantId: task.tenant_id,
        agentName: task.agent,
        context: `Successfully executed ${task.task_type} task: ${JSON.stringify(task.payload).substring(0, 200)}...`,
        type: 'history'
      });
    }
    
    return {
      success: true,
      result: data,
      xp_delta
    };
    
  } catch (err: any) {
    console.error(`Agent task execution error (${task.agent}/${task.task_type}):`, err);
    
    // Calculate negative XP for failed task
    const xp_delta = -5; // Negative XP for failures
    
    // Update task as failed
    if (task.tenant_id) {
      // Log failure to agent memory for learning
      await logAgentMemory({
        tenantId: task.tenant_id,
        agentName: task.agent,
        context: `Failed to execute ${task.task_type} task: ${err.message}`,
        type: 'feedback'
      });
    }
    
    return {
      success: false,
      error: err.message || "Unknown error executing agent task",
      xp_delta
    };
  }
};

// Helper function to calculate XP based on task complexity and outcome
function calculateTaskXP(taskType: string, complexity: string, success: boolean): number {
  // Base XP values
  const baseXP = {
    simple: 5,
    normal: 10,
    complex: 20,
    critical: 30
  }[complexity] || 10;
  
  // Task type multipliers
  const typeMultiplier = {
    'execution': 1.0,
    'analysis': 1.2,
    'creation': 1.5,
    'optimization': 1.3,
    'recovery': 1.8
  }[taskType] || 1.0;
  
  // Calculate final XP
  return success ? Math.round(baseXP * typeMultiplier) : -5;
}

// React hook for executing agent tasks with billing integration
export const useAgentTaskExecution = () => {
  const { useCredits } = useCreditsManager();
  
  const executeTask = async (task: AgentTask, creditCost: number = 1) => {
    try {
      // First check if we have enough credits
      const creditSuccess = await useCredits(creditCost, `Agent: ${task.agent}`, task.agent);
      if (!creditSuccess) {
        toast.error("Not enough credits", {
          description: `You need ${creditCost} credits to perform this operation.`
        });
        return { success: false, error: "Insufficient credits" };
      }
      
      // Execute the task after billing check
      const result = await executeAgentTask(task);
      
      // Show XP notification if available
      if (result.success && result.xp_delta) {
        toast.success(`${task.agent} gained ${result.xp_delta} XP`, {
          description: "Agent performance is improving!"
        });
      }
      
      return result;
      
    } catch (err: any) {
      toast.error("Task execution failed", {
        description: err.message || "An unknown error occurred"
      });
      return { success: false, error: err.message || "Task execution failed" };
    }
  };
  
  return { executeTask };
};
