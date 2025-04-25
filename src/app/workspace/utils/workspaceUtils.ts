
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { ToastService } from "@/services/ToastService";

/**
 * Creates a default workspace for a new user
 * Part of the Auth → Onboarding user journey flow
 * @param onSuccess Optional callback function on successful workspace creation
 * @returns The newly created workspace or null if creation failed
 */
export async function createDefaultWorkspace(onSuccess?: () => void) {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user?.user?.id) {
      ToastService.error({
        title: "Authentication required",
        description: "Please sign in to create a workspace"
      });
      return null;
    }

    // Check if user is authenticated before proceeding
    const userId = user.user.id;
    
    // Get user email or generate random name
    const { data: userData } = await supabase.auth.getUser();
    const email = userData?.user?.email || '';
    
    // Create a workspace name from email or generate one
    const workspaceName = email 
      ? `${email.split('@')[0]}'s Workspace`
      : `New Workspace ${Math.floor(Math.random() * 1000)}`;
    
    // Generate a new tenant ID
    const newTenantId = uuidv4();
    
    // Create the tenant profile
    const { data: tenant, error: tenantError } = await supabase
      .from('tenant_profiles')
      .insert({
        id: newTenantId,
        name: workspaceName,
        theme_mode: 'light',
        theme_color: 'indigo'
      })
      .select()
      .single();
    
    if (tenantError) {
      console.error("[createDefaultWorkspace] Error creating tenant:", tenantError);
      throw new Error(tenantError.message);
    }
    
    // Assign the user to the tenant with admin role
    const { error: roleError } = await supabase
      .from('tenant_user_roles')
      .insert({
        tenant_id: newTenantId,
        user_id: userId,
        role: 'admin'
      });
    
    if (roleError) {
      console.error("[createDefaultWorkspace] Error assigning role:", roleError);
      throw new Error(roleError.message);
    }
    
    // Call onSuccess callback if provided
    if (onSuccess && typeof onSuccess === 'function') {
      onSuccess();
    }
    
    ToastService.success({
      title: "Workspace created",
      description: `Your new workspace "${workspaceName}" is ready to use`
    });
    
    return tenant;
  } catch (error: any) {
    console.error("[createDefaultWorkspace] Unexpected error:", error);
    ToastService.error({
      title: "Error creating workspace",
      description: error.message || "An unexpected error occurred"
    });
    return null;
  }
}
