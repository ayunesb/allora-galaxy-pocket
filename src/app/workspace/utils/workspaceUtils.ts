
import type { TenantOption } from "../hooks/useAvailableTenants";
import { supabase } from "@/integrations/supabase/client";
import { Tenant } from "@/types/tenant";

export function handleTenantChange(
  value: string,
  availableTenants: TenantOption[],
  setSelected: (id: string) => void,
  setTenant: (tenant: TenantOption) => void,
  toast: any
) {
  const selectedTenant = availableTenants.find((t) => t.id === value);
  if (selectedTenant) {
    console.log("[handleTenantChange] Switching to tenant:", selectedTenant.name, selectedTenant.id);
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
  toast: any,
  onSuccess?: () => void
): Promise<Tenant | null> {
  try {
    console.log("[createDefaultWorkspace] Starting workspace creation process");
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("[createDefaultWorkspace] Error getting user:", userError);
      toast({
        title: "Authentication error",
        description: "Could not verify your login details. Try signing in again.",
        variant: "destructive"
      });
      return null;
    }
    
    if (!user) {
      console.error("[createDefaultWorkspace] No authenticated user found");
      toast({
        title: "Authentication required",
        description: "Please sign in to create a workspace.",
        variant: "destructive"
      });
      return null;
    }
    
    console.log("[createDefaultWorkspace] Creating workspace for user:", user.id);
    
    // Create a new default workspace
    const { data: newTenant, error } = await supabase
      .from('tenant_profiles')
      .insert([
        { 
          name: 'My Workspace',
          theme_color: 'indigo',
          theme_mode: 'light',
          enable_auto_approve: true,
          isDemo: false
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error("[createDefaultWorkspace] Error creating workspace:", error);
      
      // Show specific error message based on the error code
      if (error.code === '23505') { // Unique constraint violation
        toast({
          title: "Workspace already exists",
          description: "Please try a different name.",
          variant: "destructive"
        });
      } else if (error.code === '42501') { // Permission denied
        toast({
          title: "Permission denied",
          description: "You don't have permission to create a workspace.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Could not create workspace",
          description: error.message || "Please try again later.",
          variant: "destructive"
        });
      }
      
      throw error;
    }
    
    if (newTenant) {
      console.log("[createDefaultWorkspace] Workspace created successfully:", newTenant.id);
      
      // Add current user to the tenant with admin role
      try {
        console.log("[createDefaultWorkspace] Assigning admin role to user:", user.id);
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
          console.error("[createDefaultWorkspace] Could not assign role to user:", roleError);
          // Even if role assignment fails, we want to continue
          // as the workspace is created
        }
        
        // Create a company profile for the workspace immediately
        console.log("[createDefaultWorkspace] Creating company profile");
        const { error: companyError } = await supabase
          .from('company_profiles')
          .insert([{
            tenant_id: newTenant.id,
            name: 'My Company',
            industry: 'tech',
            team_size: '1-10'
          }]);
          
        if (companyError) {
          console.error("[createDefaultWorkspace] Could not create company profile:", companyError);
        }
        
        // Create a persona profile for the user in this workspace
        console.log("[createDefaultWorkspace] Creating persona profile");
        const { error: personaError } = await supabase
          .from('persona_profiles')
          .insert([{
            tenant_id: newTenant.id,
            user_id: user.id,
            tone: 'professional',
            goal: 'growth'
          }]);
          
        if (personaError) {
          console.error("[createDefaultWorkspace] Could not create persona profile:", personaError);
        }
      } catch (roleErr) {
        console.error("[createDefaultWorkspace] Role assignment failed:", roleErr);
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
    console.error("[createDefaultWorkspace] Error creating workspace:", err);
    toast({
      title: "Could not create workspace",
      description: "Please try again or contact support.",
      variant: "destructive"
    });
  }
  
  return null;
}
