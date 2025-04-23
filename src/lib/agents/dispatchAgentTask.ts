
import { supabase } from "@/integrations/supabase/client";
import { AGENT_TASK_ACCESS } from "@/config/roles";
// import { PluginRecommender_Agent } from "./PluginRecommender_Agent"; // Uncomment if/when available

type DispatchPayload = {
  user_id: string;
  agent: string;
  task_type: string;
  payload: any;
};

export async function dispatchAgentTask({ user_id, agent, task_type, payload }: DispatchPayload) {
  // Get user role (fallback to "client")
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user_id)
    .maybeSingle();

  const role = roleData?.role || "client";
  const allowed = AGENT_TASK_ACCESS[role] || [];
  const isAllowed = allowed.includes(task_type) || allowed.includes("*");

  if (!isAllowed) {
    // 1. Log denied task for retry queue (if you have this table - stub for now)
    // await supabase.from("agent_denied_tasks").insert({ user_id, agent, task_type, payload });

    // 2. Notify admin/user via agent_alerts
    await supabase.from("agent_alerts").insert({
      agent,
      alert_type: "permission-denied",
      message: `❌ ${agent} could not execute "${task_type}" due to role restrictions (${role}).`
    });

    // 3. Trigger role escalation request for user
    await supabase.from("role_change_requests").insert({
      user_id,
      requested_role: "developer",
      reason: `${agent} requires higher access to complete "${task_type}"`
    });

    // 4. Ping Slack via Supabase edge function (to avoid CORS issues)
    await supabase.functions.invoke("role-change-webhook", {
      body: {
        user_id,
        changed_by: agent,
        new_role: "developer"
      }
    });

    return {
      status: "blocked",
      error: "Permission denied for this role"
    };
  }

  // 5. Execute agent task (stub: implement real agent logic as needed)
  if (agent === "PluginRecommender") {
    // return await PluginRecommender_Agent.suggest(payload);
    return { status: "executed", result: "Plugin recommendations would go here." };
  }

  return { status: "executed" };
}
