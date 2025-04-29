
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tenant } from '@/types/tenant';

/**
 * Creates a new workspace/tenant
 */
export async function createWorkspace(name: string, userId: string) {
  try {
    // Create the tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenant_profiles')
      .insert({ name })
      .select()
      .single();
    
    if (tenantError) throw tenantError;
    
    if (tenant) {
      // Assign the user as admin of the new tenant
      const { error: roleError } = await supabase
        .from('tenant_user_roles')
        .insert({
          tenant_id: tenant.id,
          user_id: userId,
          role: 'admin'
        });
      
      if (roleError) throw roleError;
      
      return tenant;
    }
    
    throw new Error('Failed to create workspace');
  } catch (error: any) {
    console.error('Error creating workspace:', error);
    toast.error('Failed to create workspace', { 
      description: error.message 
    });
    return null;
  }
}

/**
 * Checks if a user is an admin of the specified tenant
 */
export async function isWorkspaceAdmin(tenantId: string, userId: string) {
  try {
    // First check the explicit function
    const { data: adminCheck, error: adminError } = await supabase
      .rpc('is_tenant_admin', { tenant_uuid: tenantId, user_uuid: userId });
    
    if (!adminError && adminCheck !== null) {
      return adminCheck;
    }
    
    // Fallback to direct query if RPC fails
    const { data, error } = await supabase
      .from('tenant_user_roles')
      .select('role')
      .eq('tenant_id', tenantId)
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Gets all workspaces for a user
 */
export async function getUserWorkspaces(): Promise<Tenant[]> {
  try {
    const { data: tenantIds, error: tenantIdsError } = await supabase
      .rpc('get_user_tenant_ids');
    
    if (tenantIdsError) throw tenantIdsError;
    
    if (!tenantIds || tenantIds.length === 0) {
      return [];
    }
    
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenant_profiles')
      .select('*')
      .in('id', tenantIds);
    
    if (tenantsError) throw tenantsError;
    
    return tenants || [];
  } catch (error) {
    console.error('Error fetching user workspaces:', error);
    return [];
  }
}
