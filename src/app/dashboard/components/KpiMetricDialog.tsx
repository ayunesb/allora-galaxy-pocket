
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Settings2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { KpiMetric } from "@/types/kpi";

export interface KpiMetricDialogProps {
  onSuccess?: () => void;
  children?: React.ReactNode;
  metric?: KpiMetric;
}

export function KpiMetricDialog({ onSuccess, children, metric }: KpiMetricDialogProps) {
  const { tenant } = useTenant();
  const [open, setOpen] = useState(false);
  const isEditing = Boolean(metric?.id);

  const form = useForm({
    defaultValues: {
      kpi_name: metric?.kpi_name || metric?.metric || "",
      value: metric?.value || 0,
      target: metric?.target || 0
    }
  });

  const onSubmit = async (data: { kpi_name: string; value: number; target: number }) => {
    try {
      if (!tenant?.id) {
        toast.error("No tenant selected");
        return;
      }

      const payload = {
        kpi_name: data.kpi_name,
        metric: data.kpi_name, // For backward compatibility
        value: data.value,
        target: data.target,
        tenant_id: tenant.id,
      };

      let result;
      if (isEditing && metric?.id) {
        // Update existing metric
        result = await supabase
          .from('kpi_metrics')
          .update(payload)
          .eq('id', metric.id);
      } else {
        // Insert new metric
        result = await supabase
          .from('kpi_metrics')
          .insert([payload]);
      }

      if (result.error) {
        throw result.error;
      }

      toast.success(isEditing ? "KPI metric updated" : "KPI metric added");
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(`Error ${isEditing ? 'updating' : 'adding'} KPI metric: ${error.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon">
            <Settings2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit KPI Metric' : 'Add New KPI Metric'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="kpi_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KPI Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., conversion_rate, revenue, active_users" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Value</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Value</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {isEditing ? 'Update KPI Metric' : 'Add KPI Metric'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
