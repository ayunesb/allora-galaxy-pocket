
import { useTenant } from "@/hooks/useTenant";
import { useState } from "react";
import type { TenantOption } from "./useAvailableTenants";

export function useInitializeSelectedTenant(tenants: TenantOption[]) {
  const { setTenant } = useTenant();
  const [selected, setSelected] = useState<string | undefined>(undefined);

  // Run once when tenants are retrieved
  const initializeSelectedTenant = () => {
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
    } else {
      setTenant(null);
      setSelected(undefined);
      localStorage.removeItem("tenant_id");
    }
  };

  return { selected, setSelected, initializeSelectedTenant };
}
