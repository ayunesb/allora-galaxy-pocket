
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabaseClient } from "../_shared/supabase.ts";
import { AGENT_TASK_ACCESS } from "../_shared/roles.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, agent, task_type, payload } = await req.json();

    // Get role
    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user_id)
      .maybeSingle();

    const role = roleData?.role || "client";
    const allowed = AGENT_TASK_ACCESS[role] || [];
    const isAllowed = allowed.includes(task_type) || allowed.includes("*");

    if (!isAllowed) {
      // 1. Log denied task for retry queue
      await supabaseClient.from("agent_denied_tasks").insert({
        user_id, agent, task_type, payload, status: "pending"
      });

      // 2. Notify via agent_alerts
      await supabaseClient.from("agent_alerts").insert({
        agent,
        alert_type: "permission-denied",
        message: `❌ ${agent} blocked for "${task_type}" – role: ${role}`
      });

      // 3. Role escalation request
      await supabaseClient.from("role_change_requests").insert({
        user_id,
        requested_role: "developer",
        reason: `${agent} wants access to run "${task_type}"`
      });

      // 4. Slack escalation
      await supabaseClient.functions.invoke("role-change-webhook", {
        body: {
          user_id,
          changed_by: agent,
          new_role: "developer"
        }
      });

      return new Response(JSON.stringify({ status: "blocked" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // If allowed: could pass-thru to agent logic
    return new Response(JSON.stringify({ status: "executed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Dispatch Agent Task ERROR:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
