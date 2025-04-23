
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }
    
    // Check if user is admin
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();
      
    if (userRole?.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        }
      );
    }

    // Get function invocation logs to check health
    const { data: logs, error: logsError } = await supabase
      .from("supabase_function_logs")
      .select("function_id, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    
    if (logsError) throw logsError;
    
    // Get function metadata
    const { data: functions, error: functionsError } = await supabase
      .from("supabase_functions")
      .select("id, name, status, created_at, updated_at");
      
    if (functionsError) throw functionsError;
    
    // Combine data to determine health
    const functionStatus = functions.map((fn: any) => {
      // Get recent logs for this function
      const functionLogs = logs.filter((log: any) => log.function_id === fn.id);
      
      // Calculate success rate
      const totalInvocations = functionLogs.length;
      const successfulInvocations = functionLogs.filter((log: any) => log.status === 200 || log.status === 201).length;
      const successRate = totalInvocations > 0 ? successfulInvocations / totalInvocations : 1;
      
      // Function is healthy if it has a success rate over 80%
      const healthy = successRate >= 0.8;
      
      return {
        id: fn.id,
        name: fn.name,
        status: fn.status,
        healthy,
        successRate: successRate * 100,
        invocations: totalInvocations,
        lastUpdated: fn.updated_at,
      };
    });

    return new Response(
      JSON.stringify(functionStatus),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
