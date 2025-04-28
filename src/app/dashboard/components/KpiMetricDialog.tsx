
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KpiMetric } from '@/types/kpi';
import { toast } from 'sonner';
import { useTenant } from '@/hooks/useTenant';

export interface KpiMetricDialogProps {
  metric?: KpiMetric;
  onSuccess?: () => void;
}

export function KpiMetricDialog({ metric, onSuccess }: KpiMetricDialogProps) {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [kpiName, setKpiName] = useState(metric?.kpi_name || '');
  const [kpiValue, setKpiValue] = useState<string>(metric?.value?.toString() || '');
  
  const { mutate: saveMetric, isPending } = useMutation({
    mutationFn: async (formData: { kpi_name: string; value: number }) => {
      if (!tenant?.id) throw new Error('No tenant selected');
      
      const payload = {
        metric: formData.kpi_name,
        value: formData.value,
        tenant_id: tenant.id,
        recorded_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('kpi_metrics')
        .upsert(payload)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('KPI metric saved successfully');
      queryClient.invalidateQueries({ queryKey: ['kpi-metrics'] });
      setOpen(false);
      setKpiName('');
      setKpiValue('');
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      toast.error('Failed to save KPI metric', {
        description: error.message
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kpiName || !kpiValue) {
      toast.error('Please fill in all fields');
      return;
    }

    const numValue = parseFloat(kpiValue);
    if (isNaN(numValue)) {
      toast.error('Value must be a valid number');
      return;
    }

    saveMetric({ kpi_name: kpiName, value: numValue });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" /> {metric ? 'Edit Metric' : 'Add Metric'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{metric ? 'Edit KPI Metric' : 'Add New KPI Metric'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="kpiName">Metric Name</Label>
            <Input 
              id="kpiName" 
              placeholder="e.g., Revenue, Conversion Rate"
              value={kpiName}
              onChange={(e) => setKpiName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kpiValue">Value</Label>
            <Input 
              id="kpiValue" 
              type="number"
              placeholder="e.g., 75, 4.5"
              value={kpiValue}
              onChange={(e) => setKpiValue(e.target.value)}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
