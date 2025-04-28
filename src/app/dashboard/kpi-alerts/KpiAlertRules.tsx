
import React, { useState, useEffect } from 'react';
import { useTenant } from '@/hooks/useTenant';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { KpiAlertRule } from '@/types/kpi';
import { Skeleton } from '@/components/ui/skeleton';
import KpiAlertRuleForm from './KpiAlertRuleForm';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function KpiAlertRules() {
  const { tenant } = useTenant();
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<KpiAlertRule | null>(null);

  const { data: alertRules, isLoading, error, refetch } = useQuery({
    queryKey: ['kpi-alert-rules', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      try {
        const { data, error } = await supabase
          .from("kpi_alerts")
          .select("*")
          .eq("tenant_id", tenant.id)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        
        return data as KpiAlertRule[];
      } catch (err) {
        // If table doesn't exist yet, handle gracefully
        console.error("Error fetching alert rules:", err);
        return [];
      }
    },
    enabled: !!tenant?.id
  });

  const handleDelete = async (id: string) => {
    if (!tenant?.id) return;
    
    try {
      const { error } = await supabase
        .from("kpi_alerts")
        .delete()
        .eq("id", id)
        .eq("tenant_id", tenant.id);
        
      if (error) throw error;
      
      toast.success("Alert rule deleted");
      refetch();
    } catch (err) {
      console.error("Error deleting alert rule:", err);
      toast.error("Failed to delete alert rule");
    }
  };

  const handleEdit = (rule: KpiAlertRule) => {
    setEditingRule(rule);
    setShowForm(true);
  };

  const handleToggleActive = async (rule: KpiAlertRule) => {
    if (!tenant?.id) return;
    
    try {
      const { error } = await supabase
        .from("kpi_alerts")
        .update({ active: !rule.active })
        .eq("id", rule.id)
        .eq("tenant_id", tenant.id);
        
      if (error) throw error;
      
      toast.success(`Alert rule ${rule.active ? 'disabled' : 'enabled'}`);
      refetch();
    } catch (err) {
      console.error("Error toggling alert rule:", err);
      toast.error("Failed to update alert rule");
    }
  };

  const handleFormClose = (refresh?: boolean) => {
    setShowForm(false);
    setEditingRule(null);
    if (refresh) refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-red-700 font-medium flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Error loading alert rules
        </h3>
        <p className="text-red-600 text-sm mt-1">
          {error instanceof Error ? error.message : "Unknown error occurred"}
        </p>
        <Button onClick={() => refetch()} size="sm" variant="outline" className="mt-2">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">KPI Alert Rules</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            Create Alert Rule
          </Button>
        )}
      </div>

      {showForm ? (
        <KpiAlertRuleForm
          onClose={handleFormClose}
          editRule={editingRule}
        />
      ) : alertRules && alertRules.length > 0 ? (
        <div className="space-y-4">
          {alertRules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    {rule.kpi_name}
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                      rule.severity === 'high' ? 'bg-red-100 text-red-800' : 
                      rule.severity === 'medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {rule.severity}
                    </span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {rule.active ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {rule.active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  Alert when {rule.kpi_name} {rule.condition} {rule.threshold}
                  {rule.compare_period && ` compared to ${rule.compare_period}`}
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleToggleActive(rule)}
                  >
                    {rule.active ? 'Disable' : 'Enable'}
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(rule)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(rule.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-muted/50 border rounded-lg p-8 text-center">
          <h3 className="font-medium mb-2">No alert rules configured</h3>
          <p className="text-muted-foreground mb-4">
            Create alert rules to monitor your KPIs and get notified when they reach certain thresholds.
          </p>
          <Button onClick={() => setShowForm(true)}>Create Your First Alert Rule</Button>
        </div>
      )}
    </div>
  );
}
