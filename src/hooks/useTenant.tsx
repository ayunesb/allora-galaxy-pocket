
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tenant } from '@/types/tenant';
import { useAuth } from '@/hooks/useAuth';
import { ToastService } from '@/services/ToastService';

interface TenantContextType {
  tenant: Tenant | null;
  tenants: Tenant[];
  isLoading: boolean;
  error: string | null;
  switchTenant: (tenantId: string) => Promise<void>;
  createTenant: (name: string) => Promise<Tenant | null>;
  refreshTenants: () => Promise<void>;
  setTenant: (tenant: Tenant | null) => void; 
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's tenants and set active tenant
  useEffect(() => {
    const loadTenants = async () => {
      if (!user) {
        setTenant(null);
        setTenants([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Get all tenants the user has access to
        const { data: userTenants, error: tenantsError } = await supabase
          .from('tenant_user_roles')
          .select('tenant_id, role, tenant_profiles:tenant_id(id, name)')
          .eq('user_id', user.id);

        if (tenantsError) throw tenantsError;

        // Format tenant data
        const formattedTenants: Tenant[] = userTenants.map(ut => ({
          id: ut.tenant_id,
          name: ut.tenant_profiles?.name || 'Unnamed Workspace',
          role: ut.role
        }));

        setTenants(formattedTenants);

        // Check for stored active tenant preference
        const storedTenantId = localStorage.getItem('activeTenantId');
        
        if (storedTenantId && formattedTenants.some(t => t.id === storedTenantId)) {
          const activeTenant = formattedTenants.find(t => t.id === storedTenantId) || null;
          setTenant(activeTenant);
        } else if (formattedTenants.length > 0) {
          // Default to first tenant
          setTenant(formattedTenants[0]);
          localStorage.setItem('activeTenantId', formattedTenants[0].id);
        } else {
          setTenant(null);
        }
      } catch (err: any) {
        console.error('Error loading tenants:', err);
        setError(err.message || 'Failed to load workspaces');
        ToastService.error({
          title: 'Workspace Error',
          description: 'Failed to load your workspaces. Please try again.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTenants();
  }, [user]);

  const switchTenant = async (tenantId: string) => {
    const selectedTenant = tenants.find(t => t.id === tenantId);
    if (!selectedTenant) {
      setError('Workspace not found');
      return;
    }

    setTenant(selectedTenant);
    localStorage.setItem('activeTenantId', tenantId);
  };

  const createTenant = async (name: string): Promise<Tenant | null> => {
    if (!user) {
      setError('You must be logged in to create a workspace');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create new tenant profile
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenant_profiles')
        .insert({ name })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Assign user as admin of the new tenant
      const { error: roleError } = await supabase
        .from('tenant_user_roles')
        .insert({
          tenant_id: tenantData.id,
          user_id: user.id,
          role: 'admin'
        });

      if (roleError) throw roleError;

      const newTenant: Tenant = {
        id: tenantData.id,
        name: tenantData.name,
        role: 'admin'
      };

      // Update state
      setTenants([...tenants, newTenant]);
      setTenant(newTenant);
      localStorage.setItem('activeTenantId', newTenant.id);

      ToastService.success({
        title: 'Workspace Created',
        description: `"${name}" workspace has been created successfully.`
      });

      return newTenant;
    } catch (err: any) {
      console.error('Error creating tenant:', err);
      setError(err.message || 'Failed to create workspace');
      ToastService.error({
        title: 'Workspace Error',
        description: 'Failed to create workspace. Please try again.'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTenants = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const { data: userTenants, error: tenantsError } = await supabase
        .from('tenant_user_roles')
        .select('tenant_id, role, tenant_profiles:tenant_id(id, name)')
        .eq('user_id', user.id);

      if (tenantsError) throw tenantsError;

      const formattedTenants: Tenant[] = userTenants.map(ut => ({
        id: ut.tenant_id,
        name: ut.tenant_profiles?.name || 'Unnamed Workspace',
        role: ut.role
      }));

      setTenants(formattedTenants);
      
      // Ensure current tenant is still valid
      if (tenant && !formattedTenants.some(t => t.id === tenant.id)) {
        if (formattedTenants.length > 0) {
          setTenant(formattedTenants[0]);
          localStorage.setItem('activeTenantId', formattedTenants[0].id);
        } else {
          setTenant(null);
          localStorage.removeItem('activeTenantId');
        }
      }
    } catch (err: any) {
      console.error('Error refreshing tenants:', err);
      setError(err.message || 'Failed to refresh workspaces');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    tenant,
    tenants,
    isLoading,
    error,
    switchTenant,
    createTenant,
    refreshTenants,
    setTenant // Expose setTenant in the context
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  
  return context;
}
