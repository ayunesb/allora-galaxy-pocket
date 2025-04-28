
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KpiAlertRule } from "@/types/kpi";

const formSchema = z.object({
  kpi_name: z.string().min(2, { message: "KPI name is required" }),
  condition: z.enum(["<", ">", "falls_by_%", "rises_by_%"]),
  threshold: z.number().min(0, { message: "Threshold must be a positive number" }),
  compare_period: z.string().min(1, { message: "Compare period is required" }),
  severity: z.string().min(1, { message: "Severity is required" }),
  campaign_id: z.string().optional(),
  active: z.boolean().default(true)
});

type FormValues = z.infer<typeof formSchema>;

interface KpiAlertRuleFormProps {
  onSubmit: (data: FormValues) => void;
  initialValues?: Partial<KpiAlertRule>;
}

export default function KpiAlertRuleForm({ onSubmit, initialValues }: KpiAlertRuleFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kpi_name: initialValues?.kpi_name || "",
      condition: initialValues?.condition as "<" | ">" | "falls_by_%" | "rises_by_%" || ">",
      threshold: initialValues?.threshold || 0,
      compare_period: initialValues?.compare_period || "day",
      severity: initialValues?.severity || "medium",
      campaign_id: initialValues?.campaign_id || "",
      active: initialValues?.active ?? true
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="kpi_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>KPI Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Conversion Rate" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="<">Less than</SelectItem>
                    <SelectItem value=">">Greater than</SelectItem>
                    <SelectItem value="falls_by_%">Falls by percentage</SelectItem>
                    <SelectItem value="rises_by_%">Rises by percentage</SelectItem>
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
                <FormLabel>Threshold</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="e.g., 10" 
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="compare_period"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compare Period</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="quarter">Quarter</SelectItem>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Active</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Enable this alert rule
                </p>
              </div>
            </FormItem>
          )}
        />
        
        <Button type="submit">
          {initialValues ? "Update Alert Rule" : "Create Alert Rule"}
        </Button>
      </form>
    </Form>
  );
}
