
import { PlusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TenantOption } from "../hooks/useAvailableTenants";

interface WorkspaceSelectorProps {
  selected: string;
  onTenantChange: (value: string) => void;
  availableTenants: TenantOption[];
  highlight: boolean;
  isOnboarding: boolean;
  tenant: any;
  isCreating: boolean;
  onCreateWorkspace: () => void;
  userExists: boolean;
}

export const WorkspaceSelector = ({
  selected,
  onTenantChange,
  availableTenants,
  highlight,
  isOnboarding,
  tenant,
  isCreating,
  onCreateWorkspace,
  userExists
}: WorkspaceSelectorProps) => {
  const selectClasses = highlight || isOnboarding
    ? "ring-2 ring-primary ring-offset-2 transition-all duration-200"
    : "";

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
          onClick={onCreateWorkspace}
          disabled={isCreating || !userExists}
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
};
