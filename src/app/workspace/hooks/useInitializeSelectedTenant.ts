
import { useTenant } from "@/hooks/useTenant";
import { useState, useEffect } from "react";
import type { TenantOption } from "./useAvailableTenants";
import { useToast } from "@/hooks/use-toast";

export function useInitializeSelectedTenant(tenants: TenantOption[], loading: boolean, error: string | null) {
  const { setTenant } = useTenant();
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const [initialized, setInitialized] = useState(false);

  // Run once when tenants are retrieved
  useEffect(() => {
    if (loading || initialized || tenants.length === 0) return;

    const storedId = localStorage.getItem("tenant_id");
    if (storedId && tenants.some((t) => t.id === storedId)) {
      const foundTenant = tenants.find((t) => t.id === storedId);
      if (foundTenant) {
        setTenant(foundTenant);
        setSelected(foundTenant.id);
      }
    } else if (tenants.length > 0) {
      setTenant(tenants[0]);
      setSelected(tenants[0].id);
      localStorage.setItem("tenant_id", tenants[0].id);
      
      // Show toast only if switching from a previous workspace
      if (storedId && storedId !== tenants[0].id) {
        toast({
          title: "Workspace changed",
          description: `Now working in "${tenants[0].name}"`,
        });
      }
    } else {
      setTenant(null);
      setSelected(undefined);
      localStorage.removeItem("tenant_id");
    }
    
    setInitialized(true);
  }, [tenants, loading, setTenant, toast, initialized]);

  // Handle error case
  useEffect(() => {
    if (error && !loading) {
      setTenant(null);
      setSelected(undefined);
    }
  }, [error, loading, setTenant]);

  return { selected, setSelected, initialized };
}
