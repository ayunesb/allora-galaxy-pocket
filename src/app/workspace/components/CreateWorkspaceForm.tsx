
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useWorkspaceCreation, WorkspaceFormData } from '@/hooks/useWorkspaceCreation';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';

export function CreateWorkspaceForm() {
  const { user } = useAuth();
  const { setTenant } = useTenant();
  const { isCreating, createWorkspace } = useWorkspaceCreation();
  
  const form = useForm<WorkspaceFormData>({
    defaultValues: {
      name: '',
      themeMode: 'light',
      themeColor: 'indigo'
    }
  });

  const onSubmit = async (data: WorkspaceFormData) => {
    if (!user) {
      return;
    }

    const workspace = await createWorkspace(data);
    
    if (workspace) {
      setTenant(workspace);
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workspace Name</FormLabel>
              <FormControl>
                <Input placeholder="My Workspace" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isCreating || !user}>
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Workspace'
          )}
        </Button>
      </form>
    </Form>
  );
}
