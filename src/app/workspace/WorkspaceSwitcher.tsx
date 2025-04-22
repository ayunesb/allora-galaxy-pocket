
import { useTenant } from "@/hooks/useTenant";
import { useLocation } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAvailableTenants } from "./hooks/useAvailableTenants";
import { useInitializeSelectedTenant } from "./hooks/useInitializeSelectedTenant";
import { handleTenantChange } from "./utils/workspaceUtils";
import { useEffect } from "react";

export default function WorkspaceSwitcher({ highlight = false }) {
  const { tenant, setTenant } = useTenant();
  const { toast } = useToast();
  const { tenants: availableTenants, loading, error } = useAvailableTenants();
  const { selected, setSelected, initializeSelectedTenant } = useInitializeSelectedTenant(availableTenants);
  const location = useLocation();
  const isOnboarding = location.pathname === "/onboarding";

  useEffect(() => {
    initializeSelectedTenant();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableTenants]);

  const selectClasses = highlight || isOnboarding
    ? "ring-2 ring-primary ring-offset-2 transition-all duration-200"
    : "";

  const onTenantChange = (value: string) => {
    handleTenantChange(value, availableTenants, setSelected, setTenant, toast);
  };

  const handleCreateWorkspace = () => {
    toast({
      title: "Create new workspace",
      description: "This feature will be implemented soon",
    });
  };

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
        <Select value={selected} onValueChange={onTenantChange}>
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
