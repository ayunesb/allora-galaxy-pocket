
import { supabase } from "@/integrations/supabase/client";
import { AGENT_TASK_ACCESS } from "@/config/roles";
// import { PluginRecommender_Agent } from "./PluginRecommender_Agent"; // Uncomment if/when available

type DispatchPayload = {
  user_id: string;
  agent: string;
  task_type: string;
  payload: any;
  tenant_id?: string;
};

export async function dispatchAgentTask({ user_id, agent, task_type, payload, tenant_id }: DispatchPayload) {
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
    // Instead of using tables that don't exist, log to system logs
    if (tenant_id) {
      await supabase.from("system_logs").insert({ 
        tenant_id,
        user_id,
        event_type: 'agent_denied_task',
        message: `${agent} task "${task_type}" denied due to role restrictions`,
        severity: 'warning',
        meta: {
          agent,
          task_type,
          payload,
          status: "pending"
        },
        created_at: new Date().toISOString()
      });

      // Log alert
      await supabase.from("agent_alerts").insert({
        agent,
        alert_type: "permission-denied",
        message: `❌ ${agent} could not execute "${task_type}" due to role restrictions (${role}).`,
        tenant_id,
        triggered_at: new Date().toISOString()
      });
    }

    // Role change request - check if table exists first
    try {
      await supabase.from("role_change_requests").insert({
        user_id,
        requested_role: "developer",
        reason: `${agent} requires higher access to complete "${task_type}"`,
        tenant_id,
        created_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Could not create role change request:", e);
    }

    // Use generic function invoke instead
    try {
      await supabase.functions.invoke("role-change-webhook", {
        body: {
          user_id,
          changed_by: agent,
          new_role: "developer",
          tenant_id
        }
      });
    } catch (e) {
      console.warn("Could not send webhook:", e);
    }

    return {
      status: "blocked",
      error: "Permission denied for this role"
    };
  }

  // Execute agent task (stub: implement real agent logic as needed)
  if (agent === "PluginRecommender") {
    // return await PluginRecommender_Agent.suggest(payload);
    return { status: "executed", result: "Plugin recommendations would go here." };
  }

  // Log agent_tasks with prompt_version if provided
  if (tenant_id) {
    await supabase.from("agent_tasks").insert({
      agent,
      task_type,
      payload,
      status: "success",
      prompt_version: payload?.prompt_version,
      plugin_id: payload?.plugin_id || null,
      executed_at: new Date().toISOString(),
      tenant_id,
      created_at: new Date().toISOString()
    });
  }

  return { status: "executed" };
}
