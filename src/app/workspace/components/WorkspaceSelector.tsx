
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw, Check } from "lucide-react";
import { Tenant } from "@/types/tenant";
import { Badge } from "@/components/ui/badge";
import { TenantOption } from "../hooks/useAvailableTenants";

interface WorkspaceSelectorProps {
  selected: string;
  onTenantChange: (value: string) => Promise<void>;
  availableTenants: TenantOption[];
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
  // Split tenants into owned and invited
  const ownedTenants = availableTenants.filter(t => t.isOwner);
  const invitedTenants = availableTenants.filter(t => !t.isOwner);

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
            {ownedTenants.length > 0 && (
              <SelectGroup>
                <SelectLabel>My Workspaces</SelectLabel>
                {ownedTenants.map((t) => (
                  <SelectItem key={t.id} value={t.id} className="flex items-center justify-between">
                    <div className="flex items-center w-full justify-between">
                      <span>{t.name}</span>
                      <div className="flex gap-1">
                        {t.isDemo && <Badge variant="outline" className="ml-2">Demo</Badge>}
                        {tenant?.id === t.id && <Badge variant="secondary" className="ml-2">Current</Badge>}
                        <Badge variant="outline" className="bg-green-100 text-green-800 ml-2">Admin</Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
            
            {invitedTenants.length > 0 && (
              <SelectGroup>
                <SelectLabel>Invited Workspaces</SelectLabel>
                {invitedTenants.map((t) => (
                  <SelectItem key={t.id} value={t.id} className="flex items-center justify-between">
                    <div className="flex items-center w-full justify-between">
                      <span>{t.name}</span>
                      <div className="flex gap-1">
                        {t.isDemo && <Badge variant="outline" className="ml-2">Demo</Badge>}
                        {tenant?.id === t.id && <Badge variant="secondary" className="ml-2">Current</Badge>}
                        <Badge variant="outline" className="ml-2">{t.role}</Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            )}

            {availableTenants.length === 0 && (
              <div className="p-2 text-center text-sm text-muted-foreground">
                No workspaces found
              </div>
            )}
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
