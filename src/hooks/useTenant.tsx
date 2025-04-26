
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant } from '@/types/tenant';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface TenantContextType {
  tenant: Tenant | null;
  setTenant: React.Dispatch<React.SetStateAction<Tenant | null>>;
  isLoading: boolean;
  refreshTenant: () => Promise<void>;
  updateTenantProfile: (updatedTenant: Partial<Tenant>) => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const refreshTenant = async () => {
    if (!user) {
      setTenant(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Get all tenants for user
      const { data: userTenants, error: tenantsError } = await supabase
        .from('tenant_user_roles')
        .select('tenant_id')
        .eq('user_id', user.id);

      if (tenantsError) throw tenantsError;
      
      // If no tenants, set to null
      if (!userTenants.length) {
        setTenant(null);
        return;
      }

      // Attempt to load stored tenant preference
      const storedTenantId = localStorage.getItem('selected_tenant_id');
      
      // Check if stored tenant is in user's available tenants
      const tenantIdToUse = storedTenantId && 
        userTenants.some(t => t.tenant_id === storedTenantId) 
        ? storedTenantId 
        : userTenants[0].tenant_id;
      
      // Fetch tenant details
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantIdToUse)
        .single();

      if (tenantError) throw tenantError;
      
      // Store selected tenant
      localStorage.setItem('selected_tenant_id', tenantData.id);
      setTenant(tenantData);
      
    } catch (error) {
      console.error('Error loading tenant:', error);
      setTenant(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateTenantProfile = async (updatedTenant: Partial<Tenant>) => {
    if (!tenant?.id) return;
    
    try {
      const { error } = await supabase
        .from('tenants')
        .update(updatedTenant)
        .eq('id', tenant.id);
        
      if (error) throw error;
      
      setTenant(prev => prev ? { ...prev, ...updatedTenant } : null);
    } catch (error) {
      console.error('Error updating tenant:', error);
      throw error;
    }
  };

  useEffect(() => {
    refreshTenant();
  }, [user]);

  return (
    <TenantContext.Provider value={{ 
      tenant, 
      setTenant, 
      isLoading, 
      refreshTenant,
      updateTenantProfile
    }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
