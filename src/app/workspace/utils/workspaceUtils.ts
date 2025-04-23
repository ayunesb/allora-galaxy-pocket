
import { supabase } from "@/integrations/supabase/client";
import { ToastFunction } from "@/types/toast";
import { User } from "@supabase/supabase-js";

export const createDefaultWorkspace = async (
  toast: ToastFunction,
  onSuccess?: () => void
) => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      throw new Error("Authentication required to create workspaces");
    }

    const user = userData.user;

    // Create a new tenant profile with a default name
    const workspaceName = `${user.email?.split("@")[0]}'s Workspace` || "New Workspace";
    
    console.log("[workspaceUtils] Creating new workspace:", workspaceName);
    const { data: newTenant, error: tenantError } = await supabase
      .from("tenant_profiles")
      .insert({
        name: workspaceName,
        theme_mode: "light",
        theme_color: "#0284c7" // sky-600
      })
      .select("id, name, theme_mode, theme_color")
      .single();

    if (tenantError || !newTenant) {
      console.error("[workspaceUtils] Error creating tenant:", tenantError);
      throw new Error(tenantError?.message || "Failed to create workspace");
    }
    
    // Assign the user as admin for this tenant
    const { error: roleError } = await supabase
      .from("tenant_user_roles")
      .insert({
        user_id: user.id,
        tenant_id: newTenant.id,
        role: "admin"
      });

    if (roleError) {
      console.error("[workspaceUtils] Error assigning user role:", roleError);
      // Try to clean up the tenant we just created
      await supabase
        .from("tenant_profiles")
        .delete()
        .eq("id", newTenant.id);
        
      throw new Error(roleError.message || "Failed to assign user role");
    }

    console.log("[workspaceUtils] Workspace created successfully:", newTenant);
    if (onSuccess) {
      onSuccess();
    }
    
    return newTenant;
  } catch (error: any) {
    console.error("[workspaceUtils] Workspace creation failed:", error);
    toast({
      title: "Workspace Creation Failed",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    throw error;
  }
};

export const deleteWorkspace = async (tenantId: string, toast: ToastFunction) => {
  try {
    const { error } = await supabase
      .from("tenant_profiles")
      .delete()
      .eq("id", tenantId);
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error: any) {
    toast({
      title: "Delete Failed",
      description: error.message || "Could not delete workspace",
      variant: "destructive"
    });
    return false;
  }
};
