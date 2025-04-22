
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
import { Loader2, AlertCircle } from "lucide-react";
import { useLocation } from "react-router-dom";

interface TenantOption {
  id: string;
  name: string;
  theme_color?: string;
  theme_mode?: string;
}

export default function WorkspaceSwitcher({ highlight = false }) {
  const { tenant, setTenant } = useTenant();
  const [availableTenants, setAvailableTenants] = useState<TenantOption[]>([]);
  const [selected, setSelected] = useState<string | undefined>(tenant?.id);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const isOnboarding = location.pathname === "/onboarding";

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

  const selectClasses = highlight || isOnboarding 
    ? "ring-2 ring-primary ring-offset-2 transition-all duration-200" 
    : "";

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center h-12 px-2">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span>Loading workspaces...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 py-2 px-2 text-sm flex items-center">
        <AlertCircle className="h-4 w-4 mr-1" />
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
      <label className={`text-sm font-medium ${isOnboarding ? "text-primary font-bold" : "text-muted-foreground"}`}>
        Workspace {isOnboarding && <span className="text-red-500">*</span>}
      </label>
      <Select value={selected} onValueChange={handleTenantChange}>
        <SelectTrigger className={`w-full ${selectClasses}`}>
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
      {isOnboarding && !tenant && (
        <p className="text-sm mt-1 text-red-500">
          Please select a workspace to continue with onboarding
        </p>
      )}
    </div>
  );
}
