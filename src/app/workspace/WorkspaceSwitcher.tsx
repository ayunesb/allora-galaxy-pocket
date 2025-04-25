
import { useTenant } from "@/hooks/useTenant";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAvailableTenants } from "./hooks/useAvailableTenants";
import { useInitializeSelectedTenant } from "./hooks/useInitializeSelectedTenant";
import { createDefaultWorkspace } from "./utils/workspaceUtils";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { NoWorkspaces } from "./components/NoWorkspaces";
import { WorkspaceSelector } from "./components/WorkspaceSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { Tenant } from "@/types/tenant";

export default function WorkspaceSwitcher({ highlight = false }) {
  const { tenant, setTenant } = useTenant();
  const { toast } = useToast();
  const { tenants: availableTenants, loading, error, retryFetch, status } = useAvailableTenants();
  const { selected, setSelected, initialized } = useInitializeSelectedTenant(availableTenants, loading, error);
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const isOnboarding = location.pathname === "/onboarding";
  const [isCreating, setIsCreating] = useState(false);
  const [justCreated, setJustCreated] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [creationError, setCreationError] = useState<string | null>(null);

  useEffect(() => {
    if (justCreated && tenant && isOnboarding) {
      const timer = setTimeout(() => {
        window.location.href = "/onboarding";
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [justCreated, tenant, isOnboarding]);

  useEffect(() => {
    if (!loading && !authLoading && availableTenants.length === 0 && !error && retryCount < 1 && user) {
      console.log("[WorkspaceSwitcher] No tenants found but user is logged in. Auto-retrying fetch...");
      setRetryCount(prev => prev + 1);
      retryFetch();
    }
  }, [loading, authLoading, availableTenants, error, retryCount, retryFetch, user]);

  const handleCreateWorkspace = async () => {
    setCreationError(null);
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a workspace.",
        variant: "destructive"
      });
      return;
    }
    
    setIsCreating(true);
    try {
      console.log("[WorkspaceSwitcher] Creating new workspace for user:", user.id);
      const newWorkspace = await createDefaultWorkspace(() => {
        console.log("[WorkspaceSwitcher] Workspace created, refreshing tenant list");
        retryFetch();
      });
      
      if (newWorkspace) {
        console.log("[WorkspaceSwitcher] New workspace created:", newWorkspace.id, newWorkspace.name);
        setTenant(newWorkspace as Tenant);
        setSelected(newWorkspace.id);
        localStorage.setItem("tenant_id", newWorkspace.id);
        setJustCreated(true);
        
        toast({
          title: "Workspace ready",
          description: "You can now continue with onboarding.",
        });
      }
    } catch (err: any) {
      console.error("[WorkspaceSwitcher] Error in workspace creation flow:", err);
      setCreationError(err?.message || "Failed to create workspace");
      toast({
        title: "Workspace creation failed",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleFullRefresh = () => {
    window.location.reload();
  };

  const onTenantChange = (value: string) => {
    const selectedTenant = availableTenants.find((t) => t.id === value);
    if (selectedTenant) {
      console.log("[WorkspaceSwitcher] Switching to tenant:", selectedTenant.name, selectedTenant.id);
      setSelected(value);
      setTenant(selectedTenant as Tenant);
      localStorage.setItem("tenant_id", value);

      toast({
        title: "Workspace changed",
        description: `Now working in "${selectedTenant.name}"`,
      });
      
      if (isOnboarding) {
        setTimeout(() => {
          window.location.href = "/onboarding";
        }, 500);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState 
        error={error} 
        onRetry={retryFetch}
        onRefresh={handleFullRefresh}
      />
    );
  }

  if (!availableTenants || availableTenants.length === 0) {
    return (
      <NoWorkspaces
        isCreating={isCreating}
        creationError={creationError}
        onCreateWorkspace={handleCreateWorkspace}
        onRefresh={handleFullRefresh}
        userExists={!!user}
      />
    );
  }

  return (
    <WorkspaceSelector
      selected={selected || ""}
      onTenantChange={onTenantChange}
      availableTenants={availableTenants}
      highlight={highlight}
      isOnboarding={isOnboarding}
      tenant={tenant}
      isCreating={isCreating}
      onCreateWorkspace={handleCreateWorkspace}
      userExists={!!user}
    />
  );
}
