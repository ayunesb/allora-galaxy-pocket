
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with the user's JWT
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user information from token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { action, workspaceId, workspaceData } = await req.json();

    switch (action) {
      case "createWorkspace":
        return await createWorkspace(supabaseClient, user.id, workspaceData);

      case "updateWorkspace":
        return await updateWorkspace(supabaseClient, user.id, workspaceId, workspaceData);

      case "deleteWorkspace":
        return await deleteWorkspace(supabaseClient, user.id, workspaceId);

      case "transferWorkspaceOwnership":
        return await transferWorkspaceOwnership(
          supabaseClient, 
          user.id, 
          workspaceId, 
          workspaceData.newOwnerId
        );

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function createWorkspace(supabase, userId, workspaceData) {
  try {
    // Start a transaction
    // 1. Create the workspace (tenant profile)
    const { data: workspace, error: workspaceError } = await supabase
      .from('tenant_profiles')
      .insert({
        name: workspaceData.name,
        theme_mode: workspaceData.themeMode || 'light',
        theme_color: workspaceData.themeColor || 'indigo'
      })
      .select()
      .single();

    if (workspaceError) throw workspaceError;

    // 2. Add the creator as an admin
    const { error: memberError } = await supabase
      .from('tenant_user_roles')
      .insert({
        tenant_id: workspace.id,
        user_id: userId,
        role: 'admin'
      });

    if (memberError) throw memberError;

    // Log the workspace creation
    await supabase
      .from('system_logs')
      .insert({
        event_type: 'WORKSPACE_CREATED',
        message: `Workspace "${workspace.name}" created`,
        user_id: userId,
        tenant_id: workspace.id,
        meta: { workspaceId: workspace.id }
      });

    return new Response(
      JSON.stringify({ success: true, data: workspace }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating workspace:", error);
    
    return new Response(
      JSON.stringify({ error: "Failed to create workspace", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function updateWorkspace(supabase, userId, workspaceId, workspaceData) {
  try {
    // Verify user has admin access to the workspace
    const { data: userRole, error: roleError } = await supabase
      .from('tenant_user_roles')
      .select('role')
      .eq('tenant_id', workspaceId)
      .eq('user_id', userId)
      .single();

    if (roleError || !userRole || userRole.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Admin permission required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the workspace
    const { data: workspace, error: updateError } = await supabase
      .from('tenant_profiles')
      .update(workspaceData)
      .eq('id', workspaceId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log the update
    await supabase
      .from('system_logs')
      .insert({
        event_type: 'WORKSPACE_UPDATED',
        message: `Workspace "${workspace.name}" updated`,
        user_id: userId,
        tenant_id: workspaceId,
        meta: { workspaceId, changes: workspaceData }
      });

    return new Response(
      JSON.stringify({ success: true, data: workspace }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating workspace:", error);
    
    return new Response(
      JSON.stringify({ error: "Failed to update workspace", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function deleteWorkspace(supabase, userId, workspaceId) {
  try {
    // Verify user has admin access to the workspace
    const { data: userRole, error: roleError } = await supabase
      .from('tenant_user_roles')
      .select('role')
      .eq('tenant_id', workspaceId)
      .eq('user_id', userId)
      .single();

    if (roleError || !userRole || userRole.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Admin permission required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get workspace info before deletion for logging
    const { data: workspace } = await supabase
      .from('tenant_profiles')
      .select('name')
      .eq('id', workspaceId)
      .single();

    // Create an admin client with full access for deleting related data
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Delete all related data - implementing a cascading delete
    // The order matters to avoid foreign key constraint errors
    
    // 1. Log the deletion intention first (since we'll delete the tenant)
    await supabaseAdmin
      .from('system_logs')
      .insert({
        event_type: 'WORKSPACE_DELETED',
        message: `Workspace "${workspace?.name || workspaceId}" deleted`,
        user_id: userId,
        tenant_id: null, // Don't reference the tenant as it will be deleted
        meta: { workspaceId, workspaceName: workspace?.name }
      });
    
    // 2. Delete tenant user roles
    await supabaseAdmin
      .from('tenant_user_roles')
      .delete()
      .eq('tenant_id', workspaceId);
    
    // 3. Delete the tenant profile
    const { error: deleteError } = await supabaseAdmin
      .from('tenant_profiles')
      .delete()
      .eq('id', workspaceId);

    if (deleteError) throw deleteError;

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error deleting workspace:", error);
    
    return new Response(
      JSON.stringify({ error: "Failed to delete workspace", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function transferWorkspaceOwnership(supabase, userId, workspaceId, newOwnerId) {
  try {
    // Verify user has admin access to the workspace
    const { data: userRole, error: roleError } = await supabase
      .from('tenant_user_roles')
      .select('role')
      .eq('tenant_id', workspaceId)
      .eq('user_id', userId)
      .single();

    if (roleError || !userRole || userRole.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Admin permission required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the new owner exists and is a member of the workspace
    const { data: newOwnerRole, error: newOwnerError } = await supabase
      .from('tenant_user_roles')
      .select('role')
      .eq('tenant_id', workspaceId)
      .eq('user_id', newOwnerId)
      .single();

    if (newOwnerError || !newOwnerRole) {
      return new Response(
        JSON.stringify({ error: "New owner must be a member of the workspace" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the new owner's role to admin
    const { error: updateError } = await supabase
      .from('tenant_user_roles')
      .update({ role: 'admin' })
      .eq('tenant_id', workspaceId)
      .eq('user_id', newOwnerId);

    if (updateError) throw updateError;

    // Log the ownership transfer
    await supabase
      .from('system_logs')
      .insert({
        event_type: 'WORKSPACE_OWNERSHIP_TRANSFERRED',
        message: `Workspace ownership transferred to a new user`,
        user_id: userId,
        tenant_id: workspaceId,
        meta: { workspaceId, previousOwnerId: userId, newOwnerId }
      });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error transferring workspace ownership:", error);
    
    return new Response(
      JSON.stringify({ error: "Failed to transfer workspace ownership", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
