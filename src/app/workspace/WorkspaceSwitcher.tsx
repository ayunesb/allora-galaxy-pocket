
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
import { Loader2, AlertCircle, PlusCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface TenantOption {
  id: string;
  name: string;
  theme_color?: string;
  theme_mode?: string;
}

export default function WorkspaceSwitcher({ highlight = false }) {
  const { tenant, setTenant } = useTenant();
  const { user } = useAuth();
  const { toast } = useToast();
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

    async function fetchTenants() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // First try to get tenants the user has access to via user roles
        const { data: userRoles, error: rolesError } = await supabase
          .from("tenant_user_roles")
          .select("tenant_id")
          .eq("user_id", user.id);

        if (rolesError) throw rolesError;

        // If user has roles, fetch those specific tenants
        if (userRoles && userRoles.length > 0) {
          const tenantIds = userRoles.map(role => role.tenant_id);
          
          const { data: tenantsData, error: tenantsError } = await supabase
            .from("tenant_profiles")
            .select("id, name, theme_color, theme_mode")
            .in("id", tenantIds)
            .order("name", { ascending: true });

          if (tenantsError) throw tenantsError;
          setAvailableTenants(tenantsData || []);
        } else {
          // Fallback: if no specific roles found, check if any tenants exist
          // This is useful for initial setup where roles might not be set yet
          const { data, error } = await supabase
            .from("tenant_profiles")
            .select("id, name, theme_color, theme_mode")
            .limit(10)
            .order("created_at", { ascending: true });

          if (error) throw error;
          setAvailableTenants(data || []);
        }

        // Determine selected tenant from localStorage (if any), else default to first
        const stored = localStorage.getItem("tenant_id");
        let initialTenantId = stored || '';

        // If there's a stored tenant, check if it's in the available list
        if (initialTenantId) {
          const foundTenant = availableTenants.find(t => t.id === initialTenantId);
          
          if (foundTenant) {
            setTenant(foundTenant);
            setSelected(initialTenantId);
          } else if (availableTenants.length > 0) {
            // If stored tenant not found but we have tenants, use first one
            setTenant(availableTenants[0]);
            setSelected(availableTenants[0].id);
            localStorage.setItem("tenant_id", availableTenants[0].id);
          } else {
            // No tenants at all
            setTenant(null);
            setSelected(undefined);
            localStorage.removeItem("tenant_id");
          }
        } else if (availableTenants.length > 0) {
          // No stored tenant but we have tenants, use first one
          setTenant(availableTenants[0]);
          setSelected(availableTenants[0].id);
          localStorage.setItem("tenant_id", availableTenants[0].id);
        }

        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching workspaces:", err);
        setError("Could not fetch workspaces. Please refresh.");
        setLoading(false);
      }
    }

    fetchTenants();
  }, [user]);

  const handleTenantChange = (value: string) => {
    const selectedTenant = availableTenants.find(t => t.id === value);
    if (selectedTenant) {
      setSelected(value);
      setTenant(selectedTenant);
      localStorage.setItem("tenant_id", value);
      
      // Notify user of workspace change
      toast({
        title: "Workspace changed",
        description: `Now working in "${selectedTenant.name}"`,
      });
    }
  };

  const handleCreateWorkspace = () => {
    // This would be implemented later with a modal to create a new workspace
    toast({
      title: "Create new workspace",
      description: "This feature will be implemented soon",
    });
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
      <div className="space-y-3 px-2">
        <div className="px-2 text-muted-foreground text-sm">
          No workspaces found. Create your first workspace.
        </div>
        <Button 
          size="sm" 
          className="w-full"
          onClick={handleCreateWorkspace}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Workspace
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2 px-2">
      <label className={`text-sm font-medium ${isOnboarding ? "text-primary font-bold" : "text-muted-foreground"}`}>
        Workspace {isOnboarding && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center gap-2">
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
        <Button 
          variant="outline" 
          size="icon" 
          className="flex-shrink-0"
          onClick={handleCreateWorkspace}
          title="Create new workspace"
        >
          <PlusCircle className="h-4 w-4" />
        </Button>
      </div>
      {isOnboarding && !tenant && (
        <p className="text-sm mt-1 text-red-500">
          Please select a workspace to continue with onboarding
        </p>
      )}
    </div>
  );
}
