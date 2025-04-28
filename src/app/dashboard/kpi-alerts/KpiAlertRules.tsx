import React, { useState, useEffect } from "react";
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
  TableCaption,
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

export function KpiAlertRules() {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<KpiAlertRule | null>(null);

  const { data: rules, isLoading: isLoadingRules } = useQuery({
    queryKey: ["kpi-alert-rules", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];

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
    },
    enabled: !!tenant?.id,
  });

  const { data: alerts, isLoading: isLoadingAlerts } = useQuery({
    queryKey: ["kpi-alerts", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];

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
    },
    enabled: !!tenant?.id,
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("kpi_alert_rules")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting KPI alert rule:", error);
        throw error;
      }
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
        description:
          error.message || "Failed to delete KPI alert rule. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (rule: KpiAlertRule) => {
    setSelectedRule(rule);
    setOpen(true);
  };

  const handleCopy = (rule: KpiAlertRule) => {
    navigate("/kpi-alerts/create", { state: { rule } });
  };

  const handleDelete = (id: string) => {
    deleteRuleMutation.mutate(id);
  };

  const isActive = (rule: KpiAlertRule) => rule.status === 'active';

  return (
    <Card>
      <CardHeader>
        <CardTitle>KPI Alert Rules</CardTitle>
        <CardDescription>
          Manage rules that trigger alerts based on KPI metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add Alert Rule</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedRule ? "Edit Alert Rule" : "Create Alert Rule"}
                </DialogTitle>
                <DialogDescription>
                  {selectedRule
                    ? "Modify the settings for the selected alert rule."
                    : "Define a new rule to monitor KPIs and trigger alerts."}
                </DialogDescription>
              </DialogHeader>
              <KpiAlertRuleForm
                open={open}
                setOpen={setOpen}
                rule={selectedRule}
                setSelectedRule={setSelectedRule}
              />
            </DialogContent>
          </Dialog>
        </div>
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
            {rules?.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell className="font-medium">{rule.name}</TableCell>
                <TableCell>{rule.kpi_name}</TableCell>
                <TableCell>{`${rule.condition} ${rule.compare_period}`}</TableCell>
                <TableCell>{rule.threshold}</TableCell>
                <TableCell>
                  <Badge variant={rule.severity}>
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

        {alerts.filter(alert => alert.status === "pending").length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Recent Alerts</h3>
            <div className="space-y-3">
              {alerts
                .filter(alert => alert.status === "pending")
                .map((alert) => (
                  <Card key={alert.id} className="border-red-200 bg-red-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
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
