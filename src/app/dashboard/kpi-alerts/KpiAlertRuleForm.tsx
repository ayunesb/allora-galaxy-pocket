import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { toast } from "sonner";
import { KpiAlertRule } from '@/types/kpi';
import { useTenant } from '@/hooks/useTenant';
import { supabase } from '@/integrations/supabase/client';

interface KpiAlertRuleFormProps {
  onSuccess?: () => void;
  initialData?: Partial<KpiAlertRule>;
  isEditing?: boolean;
}

export default function KpiAlertRuleForm({ onSuccess, initialData, isEditing = false }: KpiAlertRuleFormProps) {
  const { tenant } = useTenant();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<Partial<KpiAlertRule>>({
    defaultValues: initialData || {
      kpi_name: '',
      condition: '>',
      threshold: 0,
      compare_period: '7d',
      severity: 'medium',
      active: true,
    }
  });
  
  const handleSubmit = async (data: Partial<KpiAlertRule>) => {
    if (!tenant?.id) {
      toast.error('No tenant selected');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const alertData = {
        ...data,
        tenant_id: tenant.id,
      };
      
      let response;
      
      if (isEditing && initialData?.id) {
        // Update existing rule
        response = await supabase
          .from('kpi_alert_rules')
          .update(alertData as any)
          .eq('id', initialData.id)
          .select();
      } else {
        // Create new rule
        response = await supabase
          .from('kpi_alert_rules')
          .insert({
            ...alertData,
            created_at: new Date().toISOString(),
          } as any)
          .select();
      }
      
      if (response.error) {
        throw response.error;
      }
      
      toast.success(isEditing ? 'Alert rule updated' : 'Alert rule created');
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form if creating new rule
      if (!isEditing) {
        form.reset({
          kpi_name: '',
          condition: '>',
          threshold: 0,
          compare_period: '7d',
          severity: 'medium',
          active: true,
        });
      }
    } catch (error: any) {
      toast.error(`Error ${isEditing ? 'updating' : 'creating'} alert rule`, {
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Alert Rule' : 'Create Alert Rule'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="kpi_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KPI Metric Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., conversion_rate" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select 
                      value={field.value as string} 
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value=">">Greater than</SelectItem>
                        <SelectItem value="<">Less than</SelectItem>
                        <SelectItem value="falls_by_%">Falls by %</SelectItem>
                        <SelectItem value="rises_by_%">Rises by %</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Threshold Value</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Threshold value" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="compare_period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compare Period</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1d">1 day</SelectItem>
                        <SelectItem value="7d">7 days</SelectItem>
                        <SelectItem value="30d">30 days</SelectItem>
                        <SelectItem value="90d">90 days</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <Select 
                      value={field.value as string} 
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <input 
                      type="checkbox" 
                      checked={field.value} 
                      onChange={(e) => field.onChange(e.target.checked)} 
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-medium">
                    Alert is active
                  </FormLabel>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Rule' : 'Create Rule'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
