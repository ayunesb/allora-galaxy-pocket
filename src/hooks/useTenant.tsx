
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { ToastService } from '@/services/ToastService';
import { useNavigate } from 'react-router-dom';
import { Tenant } from '@/types/tenant';

interface TenantContextType {
  tenant: Tenant | null;
  tenants: Tenant[];
  userRole: string;
  isLoading: boolean;
  switchTenant: (tenantId: string) => Promise<void>;
  createTenant: (name: string) => Promise<void>;
  updateTenantPreference: (key: string, value: any) => Promise<void>;
  refreshTenant: () => Promise<void>;
  setTenant: (tenant: Tenant | null) => void;
  selectTenant: (tenant: Tenant) => void;
  updateTenantProfile: (updatedTenant: Partial<Tenant>) => Promise<void>;
  error: string | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [userRole, setUserRole] = useState<string>('viewer');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load tenants and current tenant
  useEffect(() => {
    if (user) {
      loadTenants();
    } else {
      setTenant(null);
      setTenants([]);
      setIsLoading(false);
    }
  }, [user]);

  const loadTenants = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: userTenants, error } = await supabase
        .from('tenant_user_roles')
        .select(`
          tenant_id,
          role,
          tenant_profiles:tenant_id (
            id,
            name,
            theme_color,
            theme_mode,
            usage_credits,
            is_demo,
            created_at,
            slack_webhook_url,
            enable_auto_approve
          )
        `)
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      const formattedTenants = userTenants.map(item => ({
        ...item.tenant_profiles,
        role: item.role
      }));

      setTenants(formattedTenants);

      // Load current tenant from localStorage or use first available
      const savedTenantId = localStorage.getItem('currentTenantId');
      const targetTenant = savedTenantId 
        ? formattedTenants.find(t => t.id === savedTenantId)
        : formattedTenants[0];

      if (targetTenant) {
        setTenant(targetTenant);
        // Use the role from the tenant data directly
        const tenantRole = targetTenant.role as string || 'viewer';
        setUserRole(tenantRole);
        localStorage.setItem('currentTenantId', targetTenant.id);
      } else if (formattedTenants.length > 0) {
        setTenant(formattedTenants[0]);
        // Use the role from the first tenant
        const tenantRole = formattedTenants[0].role as string || 'viewer';
        setUserRole(tenantRole);
        localStorage.setItem('currentTenantId', formattedTenants[0].id);
      }
    } catch (error: any) {
      console.error('Error loading tenants:', error);
      ToastService.error("Failed to load workspace data");
      setError(error.message || "Failed to load workspaces");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTenant = async () => {
    if (!tenant?.id || !user?.id) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tenant_profiles')
        .select('*')
        .eq('id', tenant.id)
        .single();
        
      if (error) throw error;
      if (data) {
        setTenant({
          ...tenant,
          ...data
        });
      }
    } catch (error: any) {
      console.error('Error refreshing tenant:', error);
      setError(error.message || "Failed to refresh workspace");
      ToastService.error("Failed to refresh workspace data");
    } finally {
      setIsLoading(false);
    }
  };

  const switchTenant = async (tenantId: string) => {
    const newTenant = tenants.find(t => t.id === tenantId);
    if (newTenant) {
      setTenant(newTenant);
      const tenantRole = newTenant.role as string || 'viewer';
      setUserRole(tenantRole);
      localStorage.setItem('currentTenantId', tenantId);
      ToastService.success(`Switched to ${newTenant.name}`);
      navigate('/dashboard');
    } else {
      ToastService.error("Workspace not found");
    }
  };

  const selectTenant = (newTenant: Tenant) => {
    if (newTenant?.id) {
      setTenant(newTenant);
      const tenantRole = newTenant.role as string || 'viewer'; 
      setUserRole(tenantRole);
      localStorage.setItem('currentTenantId', newTenant.id);
      ToastService.success(`Switched to ${newTenant.name}`);
      navigate('/dashboard');
    }
  };

  const createTenant = async (name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Create the tenant
      const { data: newTenant, error: tenantError } = await supabase
        .from('tenant_profiles')
        .insert({
          name,
          usage_credits: 100,
          theme_mode: 'light',
          theme_color: 'indigo',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Add the current user as admin
      const { error: roleError } = await supabase
        .from('tenant_user_roles')
        .insert({
          user_id: user?.id,
          tenant_id: newTenant.id,
          role: 'admin',
          created_at: new Date().toISOString()
        });

      if (roleError) throw roleError;

      // Reload tenants and switch to new one
      await loadTenants();
      await switchTenant(newTenant.id);
      
      ToastService.success({
        title: "Workspace created",
        description: `You're now in ${name}`
      });
      
    } catch (error: any) {
      console.error('Error creating tenant:', error);
      setError(error.message || "Failed to create workspace");
      ToastService.error({
        title: "Failed to create workspace",
        description: "Please try again later"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTenantProfile = async (updatedData: Partial<Tenant>) => {
    if (!tenant?.id) return;
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('tenant_profiles')
        .update(updatedData)
        .eq('id', tenant.id);

      if (error) throw error;

      setTenant(prev => prev ? { ...prev, ...updatedData } : null);
      ToastService.success({
        title: "Profile updated",
        description: "Workspace profile updated successfully"
      });
      
    } catch (error: any) {
      console.error('Error updating tenant profile:', error);
      setError(error.message || "Failed to update profile");
      ToastService.error({
        title: "Update failed",
        description: "Could not update workspace profile"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTenantPreference = async (key: string, value: any) => {
    if (!tenant) return;
    setError(null);

    try {
      const { error } = await supabase
        .from('tenant_profiles')
        .update({ [key]: value })
        .eq('id', tenant.id);

      if (error) throw error;

      setTenant(prev => prev ? { ...prev, [key]: value } : null);
      ToastService.success({
        title: "Preferences updated",
        description: `Updated ${key.replace('_', ' ')} successfully`
      });
      
    } catch (error: any) {
      console.error('Error updating tenant preference:', error);
      setError(error.message || "Failed to update preference");
      ToastService.error({
        title: "Failed to update preference",
        description: "Please try again later"
      });
    }
  };

  return (
    <TenantContext.Provider 
      value={{ 
        tenant, 
        tenants, 
        userRole,
        isLoading,
        switchTenant, 
        createTenant,
        updateTenantPreference,
        refreshTenant,
        setTenant,
        selectTenant,
        updateTenantProfile,
        error
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
