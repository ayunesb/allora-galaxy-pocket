
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Tenant {
  id: string;
  name: string;
  theme_color?: string;
  theme_mode?: string;
  usage_credits: number;
  is_demo?: boolean;
}

interface TenantContextType {
  tenant: Tenant | null;
  tenants: Tenant[];
  userRole: string;
  isLoading: boolean;
  switchTenant: (tenantId: string) => Promise<void>;
  createTenant: (name: string) => Promise<void>;
  updateTenantPreference: (key: string, value: any) => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [userRole, setUserRole] = useState<string>('viewer');
  const [isLoading, setIsLoading] = useState(true);
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
            is_demo
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
        setUserRole(targetTenant.role || 'viewer');
        localStorage.setItem('currentTenantId', targetTenant.id);
      } else if (formattedTenants.length > 0) {
        setTenant(formattedTenants[0]);
        setUserRole(formattedTenants[0].role || 'viewer');
        localStorage.setItem('currentTenantId', formattedTenants[0].id);
      }

    } catch (error) {
      console.error('Error loading tenants:', error);
      toast.error("Failed to load workspace data");
    } finally {
      setIsLoading(false);
    }
  };

  const switchTenant = async (tenantId: string) => {
    const newTenant = tenants.find(t => t.id === tenantId);
    if (newTenant) {
      setTenant(newTenant);
      setUserRole(newTenant.role || 'viewer');
      localStorage.setItem('currentTenantId', tenantId);
      toast.success(`Switched to ${newTenant.name}`);
      navigate('/dashboard');
    } else {
      toast.error("Workspace not found");
    }
  };

  const createTenant = async (name: string) => {
    setIsLoading(true);
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
      
      toast({
        title: "Workspace created",
        description: `You're now in ${name}`
      });
      
    } catch (error) {
      console.error('Error creating tenant:', error);
      toast({
        title: "Failed to create workspace",
        description: "Please try again later"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTenantPreference = async (key: string, value: any) => {
    if (!tenant) return;

    try {
      const { error } = await supabase
        .from('tenant_profiles')
        .update({ [key]: value })
        .eq('id', tenant.id);

      if (error) throw error;

      setTenant(prev => prev ? { ...prev, [key]: value } : null);
      toast({
        title: "Preferences updated",
        description: `Updated ${key.replace('_', ' ')} successfully`
      });
      
    } catch (error) {
      console.error('Error updating tenant preference:', error);
      toast({
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
        updateTenantPreference
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
