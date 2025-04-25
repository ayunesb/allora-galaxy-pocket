
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tenant } from '@/types/tenant';
import { useTenant } from '@/hooks/useTenant';
import { ToastService } from '@/services/ToastService';

export function useWorkspaceManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const { setTenant } = useTenant();

  const createWorkspace = async (data: {
    name: string;
    themeMode?: string;
    themeColor?: string;
  }) => {
    setIsLoading(true);
    try {
      const { data: workspace, error } = await supabase
        .from('tenant_profiles')
        .insert({
          name: data.name,
          theme_mode: data.themeMode || 'light',
          theme_color: data.themeColor || 'indigo'
        })
        .select()
        .single();

      if (error) throw error;

      // Set as current tenant
      if (workspace) {
        setTenant(workspace as Tenant);
      }

      return workspace;
    } catch (error: any) {
      console.error('Error creating workspace:', error);
      ToastService.error({
        title: "Failed to create workspace",
        description: error.message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateWorkspace = async (id: string, data: Partial<Tenant>) => {
    setIsLoading(true);
    try {
      const { data: workspace, error } = await supabase
        .from('tenant_profiles')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update current tenant if it's the active one
      if (workspace) {
        setTenant(workspace as Tenant);
      }

      return workspace;
    } catch (error: any) {
      console.error('Error updating workspace:', error);
      ToastService.error({
        title: "Failed to update workspace",
        description: error.message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createWorkspace,
    updateWorkspace
  };
}
