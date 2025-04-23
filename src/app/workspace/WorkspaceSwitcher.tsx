
import { useTenant } from "@/hooks/useTenant";
import { useLocation } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, PlusCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAvailableTenants } from "./hooks/useAvailableTenants";
import { useInitializeSelectedTenant } from "./hooks/useInitializeSelectedTenant";
import { handleTenantChange, createDefaultWorkspace } from "./utils/workspaceUtils";
import { useEffect, useState } from "react";

export default function WorkspaceSwitcher({ highlight = false }) {
  const { tenant, setTenant } = useTenant();
  const { toast } = useToast();
  const { tenants: availableTenants, loading, error, retryFetch } = useAvailableTenants();
  const { selected, setSelected } = useInitializeSelectedTenant(availableTenants, loading, error);
  const location = useLocation();
  const isOnboarding = location.pathname === "/onboarding";
  const [isCreating, setIsCreating] = useState(false);

  const selectClasses = highlight || isOnboarding
    ? "ring-2 ring-primary ring-offset-2 transition-all duration-200"
    : "";

  const onTenantChange = (value: string) => {
    handleTenantChange(value, availableTenants, setSelected, setTenant, toast);
  };

  const handleCreateWorkspace = async () => {
    setIsCreating(true);
    try {
      const newWorkspace = await createDefaultWorkspace(toast, () => {
        // After workspace creation, refresh the list
        retryFetch();
      });
      
      // If workspace was created successfully, automatically select it
      if (newWorkspace) {
        setTenant(newWorkspace);
        setSelected(newWorkspace.id);
        localStorage.setItem("tenant_id", newWorkspace.id);
      }
    } catch (err) {
      console.error("Error in workspace creation flow:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRetry = () => {
    retryFetch();
  };

  // Add window reload handler for last resort refresh
  const handleFullRefresh = () => {
    window.location.reload();
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
      <div className="space-y-3 px-2">
        <div className="text-red-500 py-2 px-2 text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="w-full mb-2"
          onClick={handleRetry}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="w-full"
          onClick={handleFullRefresh}
        >
          Refresh Page
        </Button>
      </div>
    );
  }

  if (!availableTenants || availableTenants.length === 0) {
    return (
      <div className="space-y-3 px-2">
        <div className="px-2 text-muted-foreground text-sm">
          No workspaces found. Create your first workspace.
        </div>
        <Button
          size="sm"
          className="w-full"
          onClick={handleCreateWorkspace}
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Workspace
            </>
          )}
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
          disabled={isCreating}
          title="Create new workspace"
        >
          {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
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
