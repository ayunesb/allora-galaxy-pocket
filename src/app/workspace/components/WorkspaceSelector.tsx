
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

interface WorkspaceSelectorProps {
  onTenantChange?: (value: string) => void;
}

export function WorkspaceSelector({ onTenantChange }: WorkspaceSelectorProps) {
  const { tenant } = useTenant();
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

  const handleSelectTenant = (value: string) => {
    setOpen(false);
    if (onTenantChange) {
      onTenantChange(value);
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
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search workspace..." />
          <CommandList>
            <CommandEmpty>No workspace found.</CommandEmpty>
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
