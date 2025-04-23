
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabaseClient } from "../_shared/supabase.ts";
import { AGENT_TASK_ACCESS } from "../_shared/roles.ts";

serve(async () => {
  // Fetch pending retry tasks
  const { data: queue = [], error } = await supabaseClient
    .from("agent_denied_tasks")
    .select("*")
    .eq("status", "pending");

  if (error) {
    return new Response("Failed to fetch queue: " + error.message, { status: 500 });
  }

  for (const task of queue) {
    // Check if user is now allowed
    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", task.user_id)
      .maybeSingle();

    const role = roleData?.role || "client";
    const allowed = AGENT_TASK_ACCESS[role] || [];
    const isAllowed = allowed.includes(task.task_type) || allowed.includes("*");

    if (isAllowed) {
      // Could trigger agent here if needed
      await supabaseClient
        .from("agent_denied_tasks")
        .update({ status: "retried" })
        .eq("id", task.id);
    }
  }

  return new Response("Retried allowed tasks.", { status: 200 });
});
