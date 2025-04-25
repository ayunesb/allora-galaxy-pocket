
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Tenant } from '@/types/tenant';
import { TenantContext, TenantContextType } from '@/contexts/TenantContext';

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
      
      // Get tenant ID from local storage or user metadata
      const savedTenantId = localStorage.getItem("tenant_id") || user?.app_metadata?.tenant_id;
      
      if (!savedTenantId) {
        setTenant(null);
        setIsLoading(false);
        return;
      }
      
      // Get the current tenant for the authenticated user
      const { data, error } = await supabase
        .from('tenant_profiles')
        .select('*')
        .eq('id', savedTenantId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error fetching tenant:', error);
          throw error;
        }
        setTenant(null);
      } else {
        setTenant(data);
      }
    } catch (error) {
      console.error('Error in refreshTenant:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Add the updateTenantProfile method
  const updateTenantProfile = async (updatedTenant: Partial<Tenant>) => {
    if (!tenant?.id) {
      throw new Error('No active tenant to update');
    }

    const { data, error } = await supabase
      .from('tenant_profiles')
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
    <TenantContext.Provider 
      value={{ 
        tenant, 
        setTenant, 
        isLoading, 
        refreshTenant,
        updateTenantProfile
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  
  return context;
};
