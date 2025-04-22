
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { KpiMetric } from "@/types/kpi";

interface KpiMetricDialogProps {
  metric?: KpiMetric;
  onSuccess?: () => void;
}

export function KpiMetricDialog({ metric, onSuccess }: KpiMetricDialogProps) {
  const { toast } = useToast();
  const { tenant } = useTenant();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    label: metric?.label || "",
    value: metric?.value || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant?.id) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("kpi_metrics")
        .upsert({
          tenant_id: tenant.id,
          metric: form.label,
          value: form.value
        });

      if (error) throw error;

      toast({
        title: metric ? "KPI Updated" : "KPI Added",
        description: `Successfully ${metric ? "updated" : "added"} the KPI metric.`
      });

      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {metric ? (
          <Button variant="ghost" size="sm">Edit</Button>
        ) : (
          <Button>
            Add KPI
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{metric ? "Edit" : "Add"} KPI Metric</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Metric Name</Label>
            <Input
              id="label"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="e.g., Revenue, Users, Conversion Rate"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Current Value</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder="e.g., 1500"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : metric ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
