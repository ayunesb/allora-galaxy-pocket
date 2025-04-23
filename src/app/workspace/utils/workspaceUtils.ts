
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/hooks/use-toast";
import { ToastFunction } from "@/types/toast";

export async function createDefaultWorkspace(
  toast: ToastFunction,
  onSuccess?: () => void
) {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      throw new Error("You must be logged in to create a workspace");
    }

    const workspaceId = uuidv4();
    const workspaceName = `My Workspace`;

    // Create the tenant profile
    const { error: tenantError } = await supabase
      .from("tenant_profiles")
      .insert({
        id: workspaceId,
        name: workspaceName,
        theme_color: "indigo",
        theme_mode: "light",
        enable_auto_approve: true
      });

    if (tenantError) throw tenantError;

    // Create tenant user role association
    const { error: roleError } = await supabase
      .from("tenant_user_roles")
      .insert({
        tenant_id: workspaceId,
        user_id: user.user.id,
        role: "admin"
      });

    if (roleError) {
      console.error("[createDefaultWorkspace] Error creating role:", roleError);
      // Continue even if role assignment fails - we'll fix it later
    }

    // Call the success callback if provided
    if (onSuccess) {
      onSuccess();
    }

    return {
      id: workspaceId,
      name: workspaceName,
      theme_color: "indigo",
      theme_mode: "light",
      enable_auto_approve: true
    };
  } catch (error: any) {
    console.error("[createDefaultWorkspace] Error:", error);
    toast({
      title: "Failed to create workspace",
      description: error.message || "Please try again",
      variant: "destructive",
    });
    throw error;
  }
}
