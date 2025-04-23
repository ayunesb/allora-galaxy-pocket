import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Tenant {
  id: string;
  name: string;
  theme_color?: string;
  theme_mode?: string;
  isDemo?: boolean;
}

interface TenantContextType {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // On initial load, try to restore tenant from localStorage
  useEffect(() => {
    const initTenant = async () => {
      setIsLoading(true);
      const storedId = localStorage.getItem("tenant_id");
      
      if (storedId) {
        try {
          // Fetch the tenant details from Supabase
          const { data, error } = await supabase
            .from("tenant_profiles")
            .select("id, name, theme_color, theme_mode, isDemo")
            .eq("id", storedId)
            .single();
          
          if (data && !error) {
            setTenant(data);
          } else {
            // If the stored tenant doesn't exist anymore, clear localStorage
            localStorage.removeItem("tenant_id");
            console.warn("Stored tenant not found, reset to null");
          }
        } catch (err) {
          console.error("Error initializing tenant:", err);
        }
      }
      setIsLoading(false);
    };
    
    initTenant();
  }, []);
  
  const handleSetTenant = (newTenant: Tenant | null) => {
    setTenant(newTenant);
    if (newTenant?.id) {
      localStorage.setItem("tenant_id", newTenant.id);
    } else {
      localStorage.removeItem("tenant_id");
    }
  };

  return (
    <TenantContext.Provider value={{ tenant, setTenant: handleSetTenant, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within TenantProvider");
  }
  return context;
}
