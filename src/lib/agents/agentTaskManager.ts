
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCreditsManager } from "@/hooks/useCreditsManager";

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
};

export const executeAgentTask = async (task: AgentTask): Promise<TaskExecutionResult> => {
  try {
    // Log task to agent_tasks table
    const { error: logError } = await supabase.from("agent_tasks").insert({
      agent: task.agent,
      task_type: task.task_type,
      payload: task.payload,
      status: "pending",
      tenant_id: task.tenant_id,
      created_at: new Date().toISOString()
    });
    
    if (logError) {
      console.error("Error logging agent task:", logError);
    }
    
    // Call the dispatch-agent-task edge function
    const { data, error } = await supabase.functions.invoke("dispatch-agent-task", {
      body: {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        agent: task.agent,
        task_type: task.task_type,
        payload: task.payload
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
    
    return {
      success: true,
      result: data
    };
    
  } catch (err: any) {
    console.error(`Agent task execution error (${task.agent}/${task.task_type}):`, err);
    return {
      success: false,
      error: err.message || "Unknown error executing agent task"
    };
  }
};

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
      return await executeAgentTask(task);
      
    } catch (err: any) {
      toast.error("Task execution failed", {
        description: err.message || "An unknown error occurred"
      });
      return { success: false, error: err.message || "Task execution failed" };
    }
  };
  
  return { executeTask };
};
