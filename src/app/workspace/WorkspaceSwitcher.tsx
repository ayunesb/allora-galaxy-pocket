
import { useTenant } from "@/hooks/useTenant";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const availableTenants = [
  { id: "tenant-001", name: "Allora OS" },
  { id: "tenant-002", name: "Galaxy Ventures" },
  { id: "tenant-003", name: "Indie Stack" }
];

export default function WorkspaceSwitcher() {
  const { tenant, setTenant } = useTenant();
  const [selected, setSelected] = useState(tenant?.id || availableTenants[0].id);

  useEffect(() => {
    const stored = localStorage.getItem("tenant_id");
    if (stored) {
      const storedTenant = availableTenants.find(t => t.id === stored);
      if (storedTenant) {
        setTenant(storedTenant);
        setSelected(storedTenant.id);
      }
    } else {
      // Set default tenant if none selected
      setTenant(availableTenants[0]);
      setSelected(availableTenants[0].id);
      localStorage.setItem("tenant_id", availableTenants[0].id);
    }
  }, []);

  const handleTenantChange = (value: string) => {
    const selectedTenant = availableTenants.find(t => t.id === value);
    if (selectedTenant) {
      setSelected(value);
      setTenant(selectedTenant);
      localStorage.setItem("tenant_id", value);
    }
  };

  return (
    <div className="space-y-2 px-2">
      <label className="text-sm font-medium text-muted-foreground">
        Workspace
      </label>
      <Select value={selected} onValueChange={handleTenantChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select workspace" />
        </SelectTrigger>
        <SelectContent>
          {availableTenants.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
