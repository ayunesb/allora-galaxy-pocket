
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";

const formSchema = z.object({
  kpi_name: z.string().min(2, "KPI name must be at least 2 characters"),
  value: z.coerce.number().min(0, "Value must be a positive number"),
  trend: z.enum(["up", "down", "neutral"]).default("neutral")
});

type FormData = z.infer<typeof formSchema>;

interface KpiMetricDialogProps {
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function KpiMetricDialog({ onSuccess, children }: KpiMetricDialogProps) {
  const [open, setOpen] = useState(false);
  const { tenant } = useTenant();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kpi_name: "",
      value: 0,
      trend: "neutral"
    }
  });
  
  const onSubmit = async (data: FormData) => {
    if (!tenant?.id) {
      toast.error("You must be in a tenant to add KPI metrics");
      return;
    }
    
    try {
      const { error } = await supabase.from("kpi_metrics").insert({
        tenant_id: tenant.id,
        metric: data.kpi_name,
        value: data.value,
        trend: data.trend
      });
      
      if (error) throw error;
      
      toast.success("KPI metric added successfully");
      setOpen(false);
      form.reset();
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error adding KPI metric:", error);
      toast.error("Failed to add KPI metric"); 
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="ml-auto h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Add KPI</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add KPI Metric</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="kpi_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KPI Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. MRR, User Count, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="trend"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trend</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trend" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="up">Up</SelectItem>
                      <SelectItem value="down">Down</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button type="submit">Add KPI</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
