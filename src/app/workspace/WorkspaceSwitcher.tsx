
import { useTenant } from "@/hooks/useTenant";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface TenantOption {
  id: string;
  name: string;
  theme_color?: string;
  theme_mode?: string;
}

export default function WorkspaceSwitcher() {
  const { tenant, setTenant } = useTenant();
  const [availableTenants, setAvailableTenants] = useState<TenantOption[]>([]);
  const [selected, setSelected] = useState<string | undefined>(tenant?.id);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tenants the user has access to
  useEffect(() => {
    setLoading(true);
    setError(null);

    // Get user-tenants from tenant_profiles via tenant_user_roles mapping (if available)
    // For now, fetch all tenant_profiles as fallback
    async function fetchTenants() {
      try {
        // Feel free to improve with RLS by user once available
        const { data, error } = await supabase
          .from("tenant_profiles")
          .select("id, name, theme_color, theme_mode")
          .order("created_at", { ascending: true });

        if (error) throw error;
        setAvailableTenants(data || []);

        // Determine selected tenant from localStorage (if any), else default to first
        const stored = localStorage.getItem("tenant_id");
        let initialTenantId = stored || (data && data[0]?.id) || "";
        let initialTenant = (data || []).find(t => t.id === initialTenantId) || data?.[0];

        if (initialTenant) {
          setTenant(initialTenant);
          setSelected(initialTenant.id);
          localStorage.setItem("tenant_id", initialTenant.id);
        }

        setLoading(false);
      } catch (err: any) {
        setError("Could not fetch workspaces. Please refresh.");
        setLoading(false);
      }
    }

    fetchTenants();
    // eslint-disable-next-line
  }, []);

  const handleTenantChange = (value: string) => {
    const selectedTenant = availableTenants.find(t => t.id === value);
    if (selectedTenant) {
      setSelected(value);
      setTenant(selectedTenant);
      localStorage.setItem("tenant_id", value);
    }
  };

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center h-12">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span>Loading workspaces...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 py-2 px-2 text-sm">
        {error}
      </div>
    );
  }

  if (!availableTenants.length) {
    return (
      <div className="px-2 text-muted-foreground text-sm">
        No workspaces found. Ask an admin to invite you.
      </div>
    )
  }

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

