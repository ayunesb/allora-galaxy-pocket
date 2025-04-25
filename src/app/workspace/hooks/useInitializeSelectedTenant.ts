
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
    // Skip if any of these conditions are met
    if (loading || initialized || processingSelection) return;

    // Special case: No tenants available
    if (!tenants || tenants.length === 0) {
      console.log("[useInitializeSelectedTenant] No tenants available, marking as initialized");
      setInitialized(true);
      return;
    }
    
    setProcessingSelection(true);
    
    try {
      const storedId = localStorage.getItem("tenant_id");
      console.log("[useInitializeSelectedTenant] Stored tenant ID:", storedId);
      console.log("[useInitializeSelectedTenant] Available tenants:", tenants.map(t => `${t.id}:${t.name}`).join(', '));
      
      // If stored tenant exists in the available tenants, use it
      if (storedId && tenants.some((t) => t.id === storedId)) {
        const foundTenant = tenants.find((t) => t.id === storedId);
        if (foundTenant) {
          console.log("[useInitializeSelectedTenant] Restoring tenant:", foundTenant.name);
          setTenant(foundTenant);
          setSelected(foundTenant.id);
        }
      } else if (tenants.length > 0) {
        // Otherwise use the first tenant
        console.log("[useInitializeSelectedTenant] Setting default tenant:", tenants[0].name);
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
      }
    } catch (err) {
      console.error("[useInitializeSelectedTenant] Error initializing tenant selection:", err);
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
      console.error("[useInitializeSelectedTenant] Tenant loading error:", error);
      setTenant(null);
      setSelected(undefined);
    }
  }, [error, loading, setTenant, processingSelection]);

  return { selected, setSelected, initialized };
}
