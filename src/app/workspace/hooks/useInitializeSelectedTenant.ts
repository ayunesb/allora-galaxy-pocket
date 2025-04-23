
import { useTenant } from "@/hooks/useTenant";
import { useState, useEffect } from "react";
import type { TenantOption } from "./useAvailableTenants";
import { useToast } from "@/hooks/use-toast";

export function useInitializeSelectedTenant(tenants: TenantOption[], loading: boolean, error: string | null) {
  const { setTenant } = useTenant();
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const [initialized, setInitialized] = useState(false);
  const [processingSelection, setProcessingSelection] = useState(false);

  // Run once when tenants are retrieved
  useEffect(() => {
    if (loading || initialized || tenants.length === 0 || processingSelection) return;

    setProcessingSelection(true);
    
    try {
      const storedId = localStorage.getItem("tenant_id");
      if (storedId && tenants.some((t) => t.id === storedId)) {
        const foundTenant = tenants.find((t) => t.id === storedId);
        if (foundTenant) {
          setTenant(foundTenant);
          setSelected(foundTenant.id);
          console.log("Restored tenant:", foundTenant.name);
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
        console.log("Set default tenant:", tenants[0].name);
      } else {
        setTenant(null);
        setSelected(undefined);
        localStorage.removeItem("tenant_id");
        console.log("No tenants available");
      }
    } catch (err) {
      console.error("Error initializing tenant selection:", err);
      toast({
        title: "Error selecting workspace",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setInitialized(true);
      setProcessingSelection(false);
    }
  }, [tenants, loading, setTenant, toast, initialized, processingSelection]);

  // Handle error case
  useEffect(() => {
    if (error && !loading && !processingSelection) {
      setTenant(null);
      setSelected(undefined);
      console.error("Tenant loading error:", error);
    }
  }, [error, loading, setTenant, processingSelection]);

  return { selected, setSelected, initialized };
}
