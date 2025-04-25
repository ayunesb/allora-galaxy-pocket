
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from '@/integrations/supabase/client';
import { updateTenantHeader } from '@/integrations/supabase/client';
import type { Tenant } from "@/types/tenant";
import { ToastService } from "@/services/ToastService";

interface TenantContextType {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  isLoading: boolean;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenantState] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load tenant from localStorage on component mount
  useEffect(() => {
    const storedTenantId = localStorage.getItem("tenant_id");
    
    if (!storedTenantId) {
      setIsLoading(false);
      return;
    }

    const storedTenant = localStorage.getItem("tenant");
    if (storedTenant) {
      try {
        const parsedTenant = JSON.parse(storedTenant);
        setTenantState(parsedTenant);
      } catch (error) {
        console.error("Error parsing stored tenant:", error);
        localStorage.removeItem("tenant");
      }
    } else {
      // If we have an ID but no stored tenant object, try to fetch it
      fetchTenantById(storedTenantId);
    }

    setIsLoading(false);
  }, []);

  // Function to fetch tenant by ID
  const fetchTenantById = async (tenantId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tenant_profiles')
        .select('*')
        .eq('id', tenantId)
        .single();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        const fetchedTenant: Tenant = {
          id: data.id,
          name: data.name || 'Unnamed Workspace', 
          theme_mode: data.theme_mode,
          theme_color: data.theme_color,
          enable_auto_approve: data.enable_auto_approve,
          isDemo: data.is_demo
        };
        
        setTenantState(fetchedTenant);
        localStorage.setItem("tenant", JSON.stringify(fetchedTenant));
      }
    } catch (error) {
      console.error("Error fetching tenant:", error);
      ToastService.error({
        title: "Error loading workspace",
        description: "Please try selecting your workspace again"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh tenant data
  const refreshTenant = async (): Promise<void> => {
    if (!tenant?.id) return;
    await fetchTenantById(tenant.id);
  };

  // Custom setter that also updates localStorage
  const setTenant = (newTenant: Tenant | null) => {
    if (newTenant) {
      localStorage.setItem("tenant_id", newTenant.id);
      localStorage.setItem("tenant", JSON.stringify(newTenant));
      updateTenantHeader(newTenant.id); // Update Supabase client headers
    } else {
      localStorage.removeItem("tenant_id");
      localStorage.removeItem("tenant");
      updateTenantHeader(null); // Update Supabase client headers
    }
    setTenantState(newTenant);
  };

  return (
    <TenantContext.Provider value={{ tenant, setTenant, isLoading, refreshTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  
  return context;
}
