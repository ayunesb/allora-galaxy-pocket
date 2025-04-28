
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, AlertTriangle, Trash2, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import KpiAlertRuleForm from "./KpiAlertRuleForm";
import { KpiAlertRule, KpiAlert } from "@/types/kpi";

export default function KpiAlertRules() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<KpiAlertRule | null>(null);
  const [activeTab, setActiveTab] = useState("rules");

  // Fetch alert rules
  const { data: alertRules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ["kpi-alert-rules", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];

      const { data, error } = await supabase
        .from('kpi_alert_rules' as any)
        .select('*')
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as KpiAlertRule[];
    },
    enabled: !!tenant?.id,
  });

  // Fetch active alerts
  const { data: activeAlerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["kpi-active-alerts", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];

      const { data, error } = await supabase
        .from("kpi_alerts")
        .select('*')
        .eq("tenant_id", tenant.id)
        .in("status", ["pending", "triggered"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as KpiAlert[];
    },
    enabled: !!tenant?.id,
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this alert rule?")) return;

    try {
      const { error } = await supabase
        .from('kpi_alert_rules' as any)
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Alert rule deleted");
      queryClient.invalidateQueries({ queryKey: ["kpi-alert-rules"] });
    } catch (err: any) {
      toast.error("Failed to delete alert rule", {
        description: err.message,
      });
    }
  };

  const handleEdit = (rule: KpiAlertRule) => {
    setSelectedRule(rule);
    setIsOpen(true);
  };

  const onFormSuccess = () => {
    setIsOpen(false);
    setSelectedRule(null);
    queryClient.invalidateQueries({ queryKey: ["kpi-alert-rules"] });
  };

  const handleAddNew = () => {
    setSelectedRule(null);
    setIsOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">KPI Alert Rules</h2>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Rule
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Alert Rules ({alertRules.length})</TabsTrigger>
          <TabsTrigger value="active">
            Active Alerts ({activeAlerts.length})
            {activeAlerts.length > 0 && (
              <AlertTriangle className="ml-2 h-4 w-4 text-amber-500" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          {rulesLoading ? (
            <div className="text-center py-8">Loading alert rules...</div>
          ) : alertRules.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No alert rules configured yet.</p>
                <Button onClick={handleAddNew} variant="outline">Create your first rule</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {alertRules.map((rule) => (
                <Card key={rule.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-medium">
                        {rule.kpi_name}
                      </CardTitle>
                      <Badge variant={rule.active ? "default" : "outline"}>
                        {rule.active ? "Active" : "Disabled"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Condition:</p>
                        <p className="text-sm">
                          {rule.condition === '>' ? 'Greater than' : 
                           rule.condition === '<' ? 'Less than' :
                           rule.condition === 'falls_by_%' ? 'Falls by %' :
                           rule.condition === 'rises_by_%' ? 'Rises by %' : 
                           rule.condition} {rule.threshold}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Severity:</p>
                        <p className="text-sm capitalize">{rule.severity}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(rule)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(rule.id)}
                        className="text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active">
          {alertsLoading ? (
            <div className="text-center py-8">Loading active alerts...</div>
          ) : activeAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No active alerts at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeAlerts.map((alert) => (
                <Card key={alert.id} className={`border-l-4 ${getSeverityBorderColor(alert.severity)}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium">{alert.kpi_name}</h3>
                      <Badge variant={alert.status === "triggered" ? "destructive" : "outline"}>
                        {alert.status}
                      </Badge>
                    </div>
                    <p className="text-sm mb-2">
                      {alert.description || `Alert for ${alert.kpi_name}`}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Current value:</p>
                        <p>{alert.current_value}</p>
                      </div>
                      <div>
                        <p className="font-medium">Threshold:</p>
                        <p>{alert.threshold}</p>
                      </div>
                    </div>
                    {alert.message && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        {alert.message}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogTitle>
            {selectedRule ? "Edit Alert Rule" : "Create Alert Rule"}
          </DialogTitle>
          <KpiAlertRuleForm
            initialData={selectedRule || undefined}
            isEditing={!!selectedRule}
            onSuccess={onFormSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to get severity border color
function getSeverityBorderColor(severity?: string) {
  switch (severity) {
    case "low":
      return "border-blue-500";
    case "medium":
      return "border-yellow-500";
    case "high":
      return "border-orange-500";
    case "critical":
      return "border-red-500";
    default:
      return "border-gray-500";
  }
}
