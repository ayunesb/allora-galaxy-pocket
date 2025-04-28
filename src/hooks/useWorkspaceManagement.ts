
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tenant } from '@/types/tenant';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';
import { toast as showToast } from "sonner";

interface WorkspaceData {
  name?: string;
  themeMode?: "light" | "system" | "dark";
  themeColor?: string;
  slack_webhook_url?: string;
  enable_auto_approve?: boolean;
  is_demo?: boolean;
}

export function useWorkspaceManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setTenant } = useTenant();
  const { session } = useAuth();

  const createWorkspace = async (data: {
    name: string;
    themeMode?: string;
    themeColor?: string;
  }): Promise<Tenant | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First attempt to use the edge function for the creation
      try {
        const { data: response, error: edgeFunctionError } = await supabase.functions.invoke(
          "workspace-management",
          {
            body: {
              action: "createWorkspace",
              workspaceData: {
                name: data.name,
                themeMode: data.themeMode || 'light',
                themeColor: data.themeColor || 'indigo'
              }
            }
          }
        );
        
        if (!edgeFunctionError && response.success) {
          // Set as current tenant
          setTenant(response.data as Tenant);
          return response.data as Tenant;
        }
        
        // If edge function failed, attempt direct DB creation as fallback
        console.log("Edge function failed, using direct DB creation fallback");
        
      } catch (err) {
        console.error("Error in edge function:", err);
        // Continue to fallback direct DB method
      }
      
      // Fallback to direct DB method
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

      // Create role for workspace
      if (workspace) {
        const { error: roleError } = await supabase
          .from('tenant_user_roles')
          .insert({
            tenant_id: workspace.id,
            user_id: session?.user?.id,
            role: 'admin'
          });

        if (roleError) throw roleError;

        // Set as current tenant
        setTenant(workspace as Tenant);
      }

      return workspace as Tenant;
    } catch (error: any) {
      console.error('Error creating workspace:', error);
      setError(error.message || "Failed to create workspace");
      showToast.error("Workspace creation failed", {
        description: error.message
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateWorkspace = async (id: string, data: WorkspaceData): Promise<Tenant | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First attempt to use the edge function for the update
      try {
        const { data: response, error: edgeFunctionError } = await supabase.functions.invoke(
          "workspace-management",
          {
            body: {
              action: "updateWorkspace",
              workspaceId: id,
              workspaceData: data
            }
          }
        );
        
        if (!edgeFunctionError && response.success) {
          return response.data as Tenant;
        }
        
        // If edge function failed, attempt direct DB update as fallback
        console.log("Edge function failed, using direct DB update fallback");
        
      } catch (err) {
        console.error("Error in edge function:", err);
        // Continue to fallback direct DB method
      }

      // Fallback to direct DB method
      const { data: workspace, error } = await supabase
        .from('tenant_profiles')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return workspace as Tenant;
    } catch (error: any) {
      console.error('Error updating workspace:', error);
      setError(error.message || "Failed to update workspace");
      showToast.error("Workspace update failed", {
        description: error.message
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWorkspace = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First attempt to use the edge function for deletion
      try {
        const { data: response, error: edgeFunctionError } = await supabase.functions.invoke(
          "workspace-management",
          {
            body: {
              action: "deleteWorkspace",
              workspaceId: id
            }
          }
        );
        
        if (!edgeFunctionError && response.success) {
          return true;
        }
        
        // If edge function failed, show error (deletion is critical and requires proper cascading)
        if (edgeFunctionError) {
          throw new Error("Workspace deletion must be performed by an administrator");
        }
        
      } catch (err) {
        console.error("Error in edge function:", err);
        throw err;
      }

      return true;
    } catch (error: any) {
      console.error('Error deleting workspace:', error);
      setError(error.message || "Failed to delete workspace");
      showToast.error("Workspace deletion failed", {
        description: error.message
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace
  };
}
