
import { useTenant } from "@/hooks/useTenant";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAvailableTenants } from "./hooks/useAvailableTenants";
import { useInitializeSelectedTenant } from "./hooks/useInitializeSelectedTenant";
import { createDefaultWorkspace } from "./utils/workspaceUtils";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { NoWorkspaces } from "./components/NoWorkspaces";
import { WorkspaceSelector } from "./components/WorkspaceSelector";
import { Tenant } from "@/types/tenant";
import { useTenantSwitcher } from "./hooks/useTenantSwitcher";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function WorkspaceSwitcher({ highlight = false }) {
  const { tenant } = useTenant();
  const { toast } = useToast();
  const { tenants: availableTenants, loading, error, retryFetch, status } = useAvailableTenants();
  const { selected, setSelected, initialized } = useInitializeSelectedTenant(availableTenants, loading, error);
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { switchTenant, isChanging } = useTenantSwitcher();
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
    if (!loading && !authLoading && availableTenants.length === 0 && !error && retryCount < 2 && user) {
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
        await switchTenant(newWorkspace as Tenant);
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

  const onTenantChange = async (value: string) => {
    const selectedTenant = availableTenants.find((t) => t.id === value);
    if (selectedTenant) {
      console.log("[WorkspaceSwitcher] Switching to tenant:", selectedTenant.name, selectedTenant.id);
      setSelected(value);
      
      const success = await switchTenant(selectedTenant as Tenant);
      if (success) {
        localStorage.setItem("tenant_id", value);
        
        if (isOnboarding) {
          setTimeout(() => {
            window.location.href = "/onboarding";
          }, 500);
        }
      }
    }
  };

  if (authLoading) {
    return (
      <Card>
        <CardContent className="pt-4">
          <LoadingState message="Loading authentication..." />
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-4">
          <LoadingState message="Loading workspaces..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    // Check if it's an infinite recursion error, but we should now have fixed it
    const isRecursionError = error.includes('infinite recursion');
    
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-4">
          <ErrorState 
            title="Workspace Loading Error"
            error={isRecursionError ? 
              "A database policy issue was detected. Please try refreshing the page as the fix has been applied." : 
              error}
            onRetry={retryFetch}
          />
        </CardContent>
      </Card>
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
    <div className="space-y-6">
      <WorkspaceSelector
        selected={selected || ""}
        onTenantChange={onTenantChange}
        availableTenants={availableTenants}
        highlight={highlight}
        isOnboarding={isOnboarding}
        tenant={tenant}
        isCreating={isCreating || isChanging}
        onCreateWorkspace={handleCreateWorkspace}
        userExists={!!user}
      />

      {tenant && !isOnboarding && (
        <div className="flex flex-col space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            asChild
            className="justify-start"
          >
            <Link to="/workspace/settings">
              Workspace Settings
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
