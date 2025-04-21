
import { supabase } from "@/integrations/supabase/client";

export type RetryQueuePayload = {
  task: string;
  payload: Record<string, any>;
  tenant_id: string;
  retry_count?: number;
  max_attempts?: number;
};

export async function queueRetry({
  task,
  payload,
  tenant_id,
  retry_count = 0,
  max_attempts = 3
}: RetryQueuePayload) {
  try {
    const { error } = await supabase.from("retry_queue").insert({
      task,
      tenant_id,
      payload,
      retry_count,
      max_attempts,
      status: 'pending',
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error("[RetryQueue] Error queueing task:", error.message);
      throw error;
    }
  } catch (err) {
    console.error("[RetryQueue] Failed to queue task:", err);
    throw err;
  }
}
