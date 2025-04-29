
import React, { useState } from 'react';
import { Check, ChevronsUpDown, Plus, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTenant } from '@/hooks/useTenant';
import { Tenant } from '@/types/tenant';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface WorkspaceSelectorProps {
  onTenantChange?: (value: string) => void;
}

export function WorkspaceSelector({ onTenantChange }: WorkspaceSelectorProps) {
  const { tenant, tenants, selectTenant } = useTenant();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleCreateWorkspace = () => {
    setOpen(false);
    navigate('/workspace/new');
  };

  const handleOpenSettings = () => {
    setOpen(false);
    navigate('/workspace/settings');
  };

  const handleSelectTenant = (selectedTenant: Tenant) => {
    setOpen(false);
    selectTenant(selectedTenant);
    
    if (onTenantChange) {
      onTenantChange(selectedTenant.id);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">
            {tenant ? tenant.name || "Unnamed workspace" : "Select workspace"}
          </span>
          {tenant?.is_demo && (
            <Badge variant="outline" className="ml-2 mr-1">Demo</Badge>
          )}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search workspace..." />
          <CommandList>
            <CommandEmpty>No workspace found.</CommandEmpty>
            
            {tenants && tenants.length > 0 && (
              <CommandGroup heading="Your Workspaces">
                {tenants.map((t) => (
                  <CommandItem
                    key={t.id}
                    value={t.id}
                    onSelect={() => handleSelectTenant(t)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <span className="mr-2">{t.name || "Unnamed"}</span>
                      {t.is_demo && <Badge variant="outline" className="text-xs">Demo</Badge>}
                    </div>
                    {tenant?.id === t.id && <Check className="h-4 w-4" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            
            <CommandSeparator />
            
            <CommandGroup heading="Actions">
              <CommandItem onSelect={handleCreateWorkspace}>
                <Plus className="mr-2 h-4 w-4" />
                <span>Create workspace</span>
              </CommandItem>
              <CommandItem onSelect={handleOpenSettings}>
                <Wrench className="mr-2 h-4 w-4" />
                <span>Manage workspaces</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
