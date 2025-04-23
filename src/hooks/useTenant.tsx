
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/supabase";
import { Tenant } from "@/types/tenant";

interface TenantContextType {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);

  // On initial load, try to restore tenant from localStorage
  useEffect(() => {
    if (initialized) return;

    const initTenant = async () => {
      setIsLoading(true);
      const storedId = localStorage.getItem("tenant_id");
      
      if (storedId) {
        try {
          // Fetch the tenant details from Supabase
          const { data, error } = await supabase
            .from("tenant_profiles")
            .select("id, name, theme_color, theme_mode, isDemo, enable_auto_approve")
            .eq("id", storedId)
            .maybeSingle();
          
          if (data && !error) {
            setTenant(data);
            console.log("Tenant loaded:", data);
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
      setInitialized(true);
    };
    
    initTenant();
  }, [initialized]);
  
  const handleSetTenant = (newTenant: Tenant | null) => {
    setTenant(newTenant);
    if (newTenant?.id) {
      localStorage.setItem("tenant_id", newTenant.id);
      console.log("Tenant set:", newTenant);
    } else {
      localStorage.removeItem("tenant_id");
      console.log("Tenant cleared");
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
