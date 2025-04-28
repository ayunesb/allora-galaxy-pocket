
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoreVertical, Edit, Copy, Trash, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTenant } from "@/hooks/useTenant";
import { supabase } from "@/integrations/supabase/client";
import { KpiAlert, KpiAlertRule } from "@/types/kpi";
import { KpiAlertRuleForm } from "./KpiAlertRuleForm";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function KpiAlertRules() {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<KpiAlertRule | null>(null);

  const { data: rules = [], isLoading: isLoadingRules } = useQuery({
    queryKey: ["kpi-alert-rules", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];

      try {
        const { data, error } = await supabase
          .from("kpi_alert_rules")
          .select("*")
          .eq("tenant_id", tenant.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching KPI alert rules:", error);
          throw error;
        }

        return data as KpiAlertRule[];
      } catch (err) {
        console.error("Error in query:", err);
        return [];
      }
    },
    enabled: !!tenant?.id,
  });

  const { data: alerts = [], isLoading: isLoadingAlerts } = useQuery({
    queryKey: ["kpi-alerts", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];

      try {
        const { data, error } = await supabase
          .from("kpi_alerts")
          .select("*")
          .eq("tenant_id", tenant.id)
          .order("triggered_at", { ascending: false });

        if (error) {
          console.error("Error fetching KPI alerts:", error);
          throw error;
        }

        return data as KpiAlert[];
      } catch (err) {
        console.error("Error in query:", err);
        return [];
      }
    },
    enabled: !!tenant?.id,
  });

  const saveRuleMutation = useMutation({
    mutationFn: async (rule: KpiAlertRule) => {
      if (rule.id === "new") {
        // Create new rule
        const { data, error } = await supabase
          .from("kpi_alert_rules")
          .insert([{ ...rule, id: undefined }])
          .select();
          
        if (error) throw error;
        return data[0];
      } else {
        // Update existing rule
        const { data, error } = await supabase
          .from("kpi_alert_rules")
          .update(rule)
          .eq("id", rule.id)
          .select();
          
        if (error) throw error;
        return data[0];
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "KPI alert rule saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["kpi-alert-rules"] });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save KPI alert rule. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("kpi_alert_rules")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "KPI alert rule deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["kpi-alert-rules"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete KPI alert rule. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (rule: KpiAlertRule) => {
    setSelectedRule(rule);
    setOpen(true);
  };

  const handleCopy = (rule: KpiAlertRule) => {
    const newRule = { ...rule, id: "new" };
    setSelectedRule(newRule);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this rule?")) {
      deleteRuleMutation.mutate(id);
    }
  };

  const handleSubmit = (rule: KpiAlertRule) => {
    saveRuleMutation.mutate(rule);
  };

  const handleAddNew = () => {
    setSelectedRule(null);
    setOpen(true);
  };

  const isActive = (rule: KpiAlertRule) => rule.status === 'active';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>KPI Alert Rules</CardTitle>
            <CardDescription>
              Manage rules that trigger alerts based on KPI metrics
            </CardDescription>
          </div>
          <Button onClick={handleAddNew}>Add Alert Rule</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>
                {selectedRule && selectedRule.id !== "new" ? "Edit Alert Rule" : "Create Alert Rule"}
              </DialogTitle>
              <DialogDescription>
                {selectedRule && selectedRule.id !== "new"
                  ? "Modify the settings for the selected alert rule."
                  : "Define a new rule to monitor KPIs and trigger alerts."}
              </DialogDescription>
            </DialogHeader>
            <KpiAlertRuleForm 
              onSubmit={handleSubmit} 
              rule={selectedRule} 
            />
          </DialogContent>
        </Dialog>

        <div className="space-y-4">
          {isLoadingRules ? (
            <div className="py-8 text-center">Loading alert rules...</div>
          ) : rules.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No alert rules configured yet.</p>
              <p className="mt-2">Add your first rule to start monitoring KPIs.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>KPI</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>{rule.kpi_name}</TableCell>
                    <TableCell>{`${rule.condition} ${rule.compare_period}`}</TableCell>
                    <TableCell>{rule.threshold}</TableCell>
                    <TableCell>
                      <Badge variant={rule.severity as "default" | "secondary" | "destructive" | "outline"}>
                        {rule.severity.charAt(0).toUpperCase() + rule.severity.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isActive(rule) ? "outline" : "secondary"}>
                        {isActive(rule) ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(rule)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopy(rule)}>
                            <Copy className="mr-2 h-4 w-4" /> Copy
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(rule.id)}
                            className="text-red-500"
                          >
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {alerts && alerts.filter(alert => alert.status === "pending").length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Recent Alerts</h3>
            <div className="space-y-3">
              {alerts
                .filter(alert => alert.status === "pending")
                .slice(0, 3)
                .map((alert) => (
                  <Card key={alert.id} className="border-red-200 bg-red-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                        {alert.kpi_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {alert.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Triggered{" "}
                        {formatDistanceToNow(new Date(alert.triggered_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
