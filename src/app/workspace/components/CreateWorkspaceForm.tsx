
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { createDefaultWorkspace } from '@/utils/workspaceUtils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface FormData {
  workspaceName: string;
}

export function CreateWorkspaceForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const form = useForm<FormData>();
  const [isCreating, setIsCreating] = React.useState(false);

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a workspace",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const workspace = await createDefaultWorkspace({
        name: data.workspaceName,
        themeMode: 'light',
        themeColor: 'indigo'
      });

      if (workspace) {
        toast({
          title: "Success",
          description: "Workspace created successfully"
        });
        form.reset();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create workspace",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="workspaceName"
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

        <Button type="submit" disabled={isCreating}>
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
