
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/hooks/useTenant';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Trash2, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  name: z.string().min(3, 'Workspace name must be at least 3 characters'),
  slack_webhook_url: z.string().optional(),
  enable_auto_approve: z.boolean(),
});

export default function EnvironmentPage() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Set up form with default values from the tenant
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: tenant?.name || '',
      slack_webhook_url: tenant?.slack_webhook_url || '',
      enable_auto_approve: tenant?.enable_auto_approve || false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!tenant) return;
    
    try {
      const { error } = await supabase
        .from('tenant_profiles')
        .update({
          name: values.name,
          slack_webhook_url: values.slack_webhook_url || null,
          enable_auto_approve: values.enable_auto_approve,
        })
        .eq('id', tenant.id);
      
      if (error) throw error;
      
      toast.success('Workspace settings updated');
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      
    } catch (error: any) {
      console.error('Error updating workspace:', error);
      toast.error('Failed to update workspace settings', {
        description: error.message
      });
    }
  };
  
  const handleDeleteWorkspace = async () => {
    if (!tenant) return;
    
    try {
      setIsDeleting(true);
      
      // First delete all user roles for the tenant
      const { error: rolesError } = await supabase
        .from('tenant_user_roles')
        .delete()
        .eq('tenant_id', tenant.id);
      
      if (rolesError) throw rolesError;
      
      // Then delete the tenant profile
      const { error } = await supabase
        .from('tenant_profiles')
        .delete()
        .eq('id', tenant.id);
      
      if (error) throw error;
      
      toast.success('Workspace deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Error deleting workspace:', error);
      toast.error('Failed to delete workspace', {
        description: error.message
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  if (!tenant) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>No Workspace Selected</CardTitle>
            <CardDescription>Please select a workspace to configure its environment</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Workspace Environment</CardTitle>
              <CardDescription>
                Configure your workspace settings and integrations
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="My Workspace" />
                    </FormControl>
                    <FormDescription>
                      This is the name that will appear in the workspace selector
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-3">Integrations</h3>
                
                <FormField
                  control={form.control}
                  name="slack_webhook_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slack Webhook URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://hooks.slack.com/services/..." />
                      </FormControl>
                      <FormDescription>
                        Connect a Slack webhook to receive notifications about strategies and campaigns
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-3">AI Settings</h3>
                
                <FormField
                  control={form.control}
                  name="enable_auto_approve"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Auto-approve Strategies
                        </FormLabel>
                        <FormDescription>
                          Allow the AI to automatically approve strategies without human review
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              {tenant.is_demo && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                  <Label className="font-medium text-yellow-800">Demo Workspace</Label>
                  <p className="text-sm text-yellow-700 mt-1">
                    This is a demo workspace with limited functionality. Some settings cannot be changed.
                  </p>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="destructive"
                onClick={() => setIsDeleting(true)}
                disabled={tenant.is_demo || isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Workspace
              </Button>
              
              <Button type="submit">
                <Wrench className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
      
      {isDeleting && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Delete Workspace</CardTitle>
            <CardDescription className="text-red-600">
              This action cannot be undone. This will permanently delete the workspace and all associated data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 font-medium mb-4">
              Are you absolutely sure you want to delete this workspace?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleting(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteWorkspace}
              >
                Delete Workspace
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
