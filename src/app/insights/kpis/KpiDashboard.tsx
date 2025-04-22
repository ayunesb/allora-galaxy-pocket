
import { KPITracker } from "@/components/KPITracker";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useQueryClient } from "@tanstack/react-query";

export default function KpiDashboard() {
  const { toast } = useToast();
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newKpi, setNewKpi] = useState({ metric: '', value: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant?.id || !newKpi.metric.trim() || !newKpi.value.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('kpi_metrics')
        .insert({
          tenant_id: tenant.id,
          metric: newKpi.metric.trim(),
          value: parseFloat(newKpi.value)
        });
        
      if (error) throw error;
      
      toast({
        title: "KPI Added",
        description: `${newKpi.metric} has been added to your dashboard.`,
      });
      
      // Reset form
      setNewKpi({ metric: '', value: '' });
      setIsOpen(false);
      
      // Refresh KPI data
      queryClient.invalidateQueries({ queryKey: ["kpi-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-kpi-summary"] });
      queryClient.invalidateQueries({ queryKey: ["kpi-snapshot"] });
    } catch (error) {
      console.error('Error adding KPI:', error);
      toast({
        title: "Error",
        description: "Failed to add KPI. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">KPI Dashboard</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add KPI
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New KPI</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="metric">Metric Name</Label>
                <Input
                  id="metric"
                  placeholder="e.g., Website Visitors, Conversion Rate"
                  value={newKpi.metric}
                  onChange={(e) => setNewKpi({ ...newKpi, metric: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Current Value</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 1500, 4.5"
                  value={newKpi.value}
                  onChange={(e) => setNewKpi({ ...newKpi, value: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? "Adding..." : "Add KPI"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <KPITracker />
    </div>
  );
}
