
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";
import { Tenant } from "@/types/tenant";
import { Badge } from "@/components/ui/badge";

interface WorkspaceSelectorProps {
  selected: string;
  onTenantChange: (value: string) => Promise<void>;
  availableTenants: Tenant[];
  highlight?: boolean;
  isOnboarding?: boolean;
  tenant: Tenant | null;
  isCreating: boolean;
  onCreateWorkspace: () => Promise<void>;
  userExists: boolean;
}

export function WorkspaceSelector({
  selected,
  onTenantChange,
  availableTenants,
  highlight = false,
  isOnboarding = false,
  tenant,
  isCreating,
  onCreateWorkspace,
  userExists
}: WorkspaceSelectorProps) {
  return (
    <div className="space-y-4">
      <div className={highlight ? "bg-primary/10 p-4 rounded-md border" : ""}>
        <Select
          value={selected}
          onValueChange={onTenantChange}
          disabled={isCreating}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a workspace" />
          </SelectTrigger>
          <SelectContent>
            {availableTenants.map((t) => (
              <SelectItem key={t.id} value={t.id} className="flex items-center justify-between">
                <span>{t.name}</span>
                {t.isDemo && <Badge variant="outline" className="ml-2">Demo</Badge>}
                {isOnboarding && tenant?.id === t.id && 
                  <Badge variant="outline" className="bg-green-100 text-green-800 ml-2">Active</Badge>
                }
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {userExists && (
        <Button
          onClick={onCreateWorkspace}
          variant="outline"
          size="sm"
          className="w-full"
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Creating workspace...
            </>
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Workspace
            </>
          )}
        </Button>
      )}
    </div>
  );
}
