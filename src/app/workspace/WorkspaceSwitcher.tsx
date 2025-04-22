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
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchTenants = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get tenant IDs the user has access to from tenant_user_roles
        const { data: userRoles, error: rolesError } = await supabase
          .from("tenant_user_roles")
          .select("tenant_id")
          .eq("user_id", user.id);

        if (rolesError) {
          console.error("Error fetching roles:", rolesError);
          throw rolesError;
        }

        let tenants: TenantOption[] = [];
        
        if (userRoles && userRoles.length > 0) {
          // Get tenant details for the available tenant IDs
          const tenantIds = userRoles.map(role => role.tenant_id);
          
          const { data: tenantsData, error: tenantsError } = await supabase
            .from("tenant_profiles")
            .select("id, name, theme_color, theme_mode")
            .in("id", tenantIds);

          if (tenantsError) throw tenantsError;
          
          if (tenantsData) {
            tenants = tenantsData;
          }
        } else {
          // Fallback: Check for any available tenants
          const { data, error } = await supabase
            .from("tenant_profiles")
            .select("id, name, theme_color, theme_mode")
            .limit(10);

          if (error) throw error;
          
          if (data) {
            tenants = data;
          }
        }
        
        setAvailableTenants(tenants);
        
        // Initialize tenant selection
        initializeSelectedTenant(tenants);
      } catch (err: any) {
        console.error("Error fetching workspaces:", err);
        setError("Could not fetch workspaces. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [user?.id]);

  // Initialize tenant selection based on localStorage or first available tenant
  const initializeSelectedTenant = (tenants: TenantOption[]) => {
    const storedId = localStorage.getItem("tenant_id");
    
    if (storedId && tenants.some(t => t.id === storedId)) {
      // Use stored tenant if it exists in the available list
      const foundTenant = tenants.find(t => t.id === storedId);
      if (foundTenant) {
        setTenant(foundTenant);
        setSelected(storedId);
      }
    } else if (tenants.length > 0) {
      // Otherwise use the first available tenant
      setTenant(tenants[0]);
      setSelected(tenants[0].id);
      localStorage.setItem("tenant_id", tenants[0].id);
    } else {
      // No tenants available
      setTenant(null);
      setSelected(undefined);
      localStorage.removeItem("tenant_id");
    }
  };

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
