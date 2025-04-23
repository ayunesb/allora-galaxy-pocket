
import type { TenantOption } from "../hooks/useAvailableTenants";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function handleTenantChange(
  value: string,
  availableTenants: TenantOption[],
  setSelected: (id: string) => void,
  setTenant: (tenant: TenantOption) => void,
  toast: (arg: any) => void
) {
  const selectedTenant = availableTenants.find((t) => t.id === value);
  if (selectedTenant) {
    setSelected(value);
    setTenant(selectedTenant);
    localStorage.setItem("tenant_id", value);

    toast({
      title: "Workspace changed",
      description: `Now working in "${selectedTenant.name}"`,
    });
    
    return true;
  }
  return false;
}

export async function createDefaultWorkspace(
  toast: (arg: any) => void,
  onSuccess?: () => void
) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a workspace.",
        variant: "destructive"
      });
      return null;
    }
    
    // Create a new default workspace
    const { data: newTenant, error } = await supabase
      .from('tenant_profiles')
      .insert([
        { 
          name: 'My Workspace',
          theme_color: 'indigo',
          theme_mode: 'light'
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating workspace:", error);
      throw error;
    }
    
    if (newTenant) {
      // Add current user to the tenant with admin role
      try {
        const { error: roleError } = await supabase
          .from('tenant_user_roles')
          .insert([
            {
              tenant_id: newTenant.id,
              user_id: user.id,
              role: 'admin'
            }
          ]);
        
        if (roleError) {
          console.warn("Could not assign role to user:", roleError);
          // Even if role assignment fails, we want to continue
          // as the workspace is created
        }
      } catch (roleErr) {
        console.warn("Role assignment failed:", roleErr);
      }
      
      toast({
        title: "Workspace created",
        description: "New workspace has been created successfully.",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Return the created tenant data
      return newTenant;
    }
  } catch (err) {
    console.error("Error creating workspace:", err);
    toast({
      title: "Could not create workspace",
      description: "Please try again or contact support.",
      variant: "destructive"
    });
  }
  
  return null;
}
