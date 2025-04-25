
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tenant } from '@/types/tenant';
import { useToast } from '@/hooks/use-toast';

export interface WorkspaceFormData {
  name: string;
  themeMode?: string;
  themeColor?: string;
}

export function useWorkspaceCreation() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const createWorkspace = async (data: WorkspaceFormData): Promise<Tenant | null> => {
    setIsCreating(true);
    setError(null);

    try {
      const { data: workspace, error: createError } = await supabase
        .from('tenant_profiles')
        .insert({
          name: data.name,
          theme_mode: data.themeMode || 'light',
          theme_color: data.themeColor || 'indigo'
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      if (!workspace) {
        throw new Error('Failed to create workspace');
      }

      // Assign the current user to the workspace with admin role
      const { error: roleError } = await supabase
        .from('tenant_user_roles')
        .insert({
          tenant_id: workspace.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          role: 'admin'
        });

      if (roleError) {
        throw roleError;
      }

      toast({
        title: "Workspace created",
        description: `Your new workspace "${workspace.name}" is ready to use`
      });

      return workspace as Tenant;
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      setError(errorMessage);
      
      toast({
        title: "Failed to create workspace",
        description: errorMessage,
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    isCreating,
    error,
    createWorkspace
  };
}
