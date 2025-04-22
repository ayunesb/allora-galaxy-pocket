
import type { TenantOption } from "../hooks/useAvailableTenants";
import { useTenant } from "@/hooks/useTenant";

export function handleTenantChange(
  value: string,
  availableTenants: TenantOption[],
  setSelected: (id: string) => void,
  setTenant: (tenant: TenantOption) => void,
  toast: (arg: any) => void
) {
  const selectedTenant = availableTenants.find((t) => t.id === value);
  if (selectedTenant) {
    setSelected(value);
    setTenant(selectedTenant);
    localStorage.setItem("tenant_id", value);

    toast({
      title: "Workspace changed",
      description: `Now working in "${selectedTenant.name}"`,
    });
    
    return true;
  }
  return false;
}

export function createDefaultWorkspace(
  toast: (arg: any) => void,
  onSuccess?: () => void
) {
  // This will be implemented when we add workspace creation functionality
  toast({
    title: "Create new workspace",
    description: "This feature will be implemented soon",
  });
  
  if (onSuccess) {
    onSuccess();
  }
}
