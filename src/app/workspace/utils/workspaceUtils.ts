
import { supabase } from '@/integrations/supabase/client';

export async function createDefaultWorkspace(onSuccess?: () => void): Promise<any> {
  try {
    // Create a new workspace with a default name
    const { data: workspace, error: workspaceError } = await supabase
      .from('tenant_profiles')
      .insert({
        name: 'My Workspace',
        theme_mode: 'light',
        theme_color: 'indigo',
        enable_auto_approve: true
      })
      .select()
      .single();

    if (workspaceError) throw workspaceError;

    // Associate the current user with this workspace as an admin
    if (workspace) {
      const { error: roleError } = await supabase
        .from('tenant_user_roles')
        .insert({
          tenant_id: workspace.id,
          role: 'admin'
        });

      if (roleError) throw roleError;

      // Set up initial company profile
      const { error: companyError } = await supabase
        .from('company_profiles')
        .insert({
          name: 'My Company',
          industry: 'Technology',
          tenant_id: workspace.id,
          team_size: 'small'
        });

      if (companyError) throw companyError;

      if (onSuccess) {
        onSuccess();
      }

      return workspace;
    }
  } catch (error) {
    console.error('Error creating workspace:', error);
    throw error;
  }
}
