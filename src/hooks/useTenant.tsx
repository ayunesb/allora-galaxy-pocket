
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Tenant } from '@/types/tenant';
import { TenantContext } from '@/contexts/TenantContext';

interface TenantContextType {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  isLoading: boolean;
  refreshTenant: () => Promise<void>;
  updateTenantProfile: (updatedTenant: Partial<Tenant>) => Promise<void>;
}

const TenantProviderContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();

  const refreshTenant = useCallback(async () => {
    if (!user) {
      setTenant(null);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get the current tenant for the authenticated user
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', user.app_metadata?.tenant_id || '')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching tenant:', error);
        throw error;
      }
      
      setTenant(data || null);
    } catch (error) {
      console.error('Error in refreshTenant:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Add the missing updateTenantProfile method
  const updateTenantProfile = async (updatedTenant: Partial<Tenant>) => {
    if (!tenant?.id) {
      throw new Error('No active tenant to update');
    }

    const { data, error } = await supabase
      .from('tenants')
      .update(updatedTenant)
      .eq('id', tenant.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tenant profile:', error);
      throw error;
    }

    setTenant(data || tenant);
    return;
  };

  // Initialize tenant when user changes
  useEffect(() => {
    refreshTenant();
  }, [user, refreshTenant]);

  return (
    <TenantProviderContext.Provider 
      value={{ 
        tenant, 
        setTenant, 
        isLoading, 
        refreshTenant,
        updateTenantProfile
      }}
    >
      {children}
    </TenantProviderContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantProviderContext);
  
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  
  return context;
};
