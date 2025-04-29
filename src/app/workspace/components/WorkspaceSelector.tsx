
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

interface TenantOption extends Tenant {
  label: string;
  value: string;
}

export function WorkspaceSelector() {
  const { tenant, tenants, selectTenant } = useTenant();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Format tenants for the dropdown
  const options: TenantOption[] = tenants?.map(t => ({
    ...t,
    label: t.name || 'Unnamed Workspace',
    value: t.id
  })) || [];

  const currentSelection = tenant ? {
    ...tenant,
    label: tenant.name || 'Unnamed Workspace',
    value: tenant.id
  } : null;

  const handleCreateWorkspace = () => {
    setOpen(false);
    navigate('/workspace/new');
  };

  const handleOpenSettings = () => {
    setOpen(false);
    navigate('/workspace/settings');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          <span className="truncate">
            {currentSelection ? currentSelection.label : "Select workspace"}
          </span>
          {currentSelection?.is_demo && (
            <Badge variant="outline" className="ml-2 mr-1">Demo</Badge>
          )}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search workspace..." />
          <CommandList>
            <CommandEmpty>No workspace found.</CommandEmpty>
            <CommandGroup heading="Workspaces">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    selectTenant(option);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between"
                >
                  <span className={option.is_demo ? 'text-muted-foreground' : ''}>
                    {option.label}
                  </span>
                  {option.value === currentSelection?.value && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup>
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
