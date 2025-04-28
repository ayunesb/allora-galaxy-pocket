
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { KpiAlertRule } from "@/types/kpi";

const formSchema = z.object({
  kpi_name: z.string().min(2, {
    message: "KPI Name must be at least 2 characters.",
  }),
  condition: z.enum(["above", "below"]),
  threshold: z.coerce.number().min(1),
  severity: z.enum(["low", "medium", "high"]),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
  status: z.enum(["active", "inactive"]),
  compare_period: z.enum(["day", "week", "month"]),
});

type FormValues = z.infer<typeof formSchema>;

interface KpiAlertRuleFormProps {
  onSubmit: (values: KpiAlertRule) => void;
  rule?: KpiAlertRule | null;
}

export function KpiAlertRuleForm({ onSubmit, rule = null }: KpiAlertRuleFormProps) {
  const { toast } = useToast();
  
  const defaultValues: FormValues = {
    kpi_name: rule?.kpi_name || "",
    condition: (rule?.condition || "above") as "above" | "below",
    threshold: rule?.threshold || 10,
    severity: (rule?.severity || "medium") as "low" | "medium" | "high",
    message: rule?.message || "",
    status: (rule?.status || "active") as "active" | "inactive",
    compare_period: (rule?.compare_period || "day") as "day" | "week" | "month"
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange"
  });

  function handleKpiAlertRuleSubmit(values: FormValues) {
    toast({
      title: "Alert rule submitted",
      description: "The KPI alert rule has been saved."
    });
    
    onSubmit({
      id: rule?.id || "new",
      name: values.kpi_name,
      kpi_name: values.kpi_name,
      condition: values.condition,
      threshold: values.threshold,
      severity: values.severity,
      message: values.message,
      status: values.status,
      created_at: rule?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tenant_id: rule?.tenant_id || "demo",
      compare_period: values.compare_period,
      active: values.status === "active"
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleKpiAlertRuleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="kpi_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>KPI Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter KPI name" {...field} />
              </FormControl>
              <FormDescription>
                This is the name of the Key Performance Indicator.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condition</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a condition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="above">Above</SelectItem>
                  <SelectItem value="below">Below</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The condition to trigger the alert.
              </FormDescription>
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
                <Input type="number" placeholder="Enter threshold" {...field} />
              </FormControl>
              <FormDescription>
                The threshold value to trigger the alert.
              </FormDescription>
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
                    <SelectValue placeholder="Select a severity" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The severity level of the alert.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter a message for the alert"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The message to display when the alert is triggered.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="compare_period"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compare Period</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select comparison period" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="day">Day over Day</SelectItem>
                  <SelectItem value="week">Week over Week</SelectItem>
                  <SelectItem value="month">Month over Month</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                How to compare metric values over time
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value === "active"}
                  onCheckedChange={(checked) => {
                    field.onChange(checked ? "active" : "inactive");
                  }}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Active
                </FormLabel>
                <FormDescription>
                  When checked, this alert rule will be active
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
