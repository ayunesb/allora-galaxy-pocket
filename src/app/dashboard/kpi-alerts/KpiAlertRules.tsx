
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, AlertTriangle, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { KpiAlertRule } from "@/types/kpi";
import KpiAlertRuleForm from "./KpiAlertRuleForm";
import { toast } from "sonner";

export default function KpiAlertRules() {
  const { tenant } = useTenant();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<KpiAlertRule | null>(null);

  const { data: alertRules, isLoading, error, refetch } = useQuery({
    queryKey: ['kpi-alert-rules', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('kpi_alert_rules')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Cast the data to KpiAlertRule type
      return data as unknown as KpiAlertRule[];
    },
    enabled: !!tenant?.id
  });

  const handleCreateRule = async (formData: any) => {
    try {
      if (!tenant?.id) return;
      
      const { error } = await supabase
        .from('kpi_alert_rules')
        .insert({
          ...formData,
          tenant_id: tenant.id
        });
        
      if (error) throw error;
      
      toast.success('Alert rule created successfully');
      setIsCreateDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(`Failed to create alert rule: ${err.message}`);
    }
  };

  const handleUpdateRule = async (formData: any) => {
    try {
      if (!editingRule?.id) return;
      
      const { error } = await supabase
        .from('kpi_alert_rules')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingRule.id);
        
      if (error) throw error;
      
      toast.success('Alert rule updated successfully');
      setEditingRule(null);
      refetch();
    } catch (err: any) {
      toast.error(`Failed to update alert rule: ${err.message}`);
    }
  };

  const toggleRuleActive = async (rule: KpiAlertRule) => {
    try {
      const { error } = await supabase
        .from('kpi_alert_rules')
        .update({ 
          active: !rule.active,
          updated_at: new Date().toISOString()
        })
        .eq('id', rule.id);
        
      if (error) throw error;
      
      toast.success(`Rule ${rule.active ? 'disabled' : 'enabled'} successfully`);
      refetch();
    } catch (err: any) {
      toast.error(`Failed to toggle rule status: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-sm text-red-700">Error loading alert rules: {(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">KPI Alert Rules</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Create Alert Rule
        </Button>
      </div>
      
      {alertRules?.length === 0 ? (
        <Card className="bg-muted/30">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">No alert rules defined yet.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Create Your First Alert Rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {alertRules?.map((rule) => (
            <Card key={rule.id} className={!rule.active ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {rule.kpi_name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`${rule.active ? 'text-green-500' : 'text-gray-400'}`}
                    onClick={() => toggleRuleActive(rule)}
                  >
                    {rule.active ? 
                      <Check className="h-4 w-4 mr-1" /> : 
                      <AlertTriangle className="h-4 w-4 mr-1" />
                    }
                    {rule.active ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm text-muted-foreground mb-3">
                  <p>
                    Condition: {rule.condition === '<' ? 'Less than' : 
                               rule.condition === '>' ? 'Greater than' :
                               rule.condition === 'falls_by_%' ? 'Falls by %' : 'Rises by %'} {rule.threshold}
                  </p>
                  <p>Compare period: {rule.compare_period}</p>
                  <p className="capitalize">Severity: {rule.severity}</p>
                </div>
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingRule(rule)}
                  >
                    Edit Rule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Alert Rule</DialogTitle>
          </DialogHeader>
          <KpiAlertRuleForm onSubmit={handleCreateRule} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={!!editingRule} onOpenChange={(open) => !open && setEditingRule(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Alert Rule</DialogTitle>
          </DialogHeader>
          {editingRule && (
            <KpiAlertRuleForm 
              initialValues={editingRule} 
              onSubmit={handleUpdateRule}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
