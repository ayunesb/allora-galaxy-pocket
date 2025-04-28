
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";

interface KpiMetricDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMetric: string | null;
  onSelectMetric: (metric: string | null) => void;
}

export default function KpiMetricDialog({ open, onOpenChange, selectedMetric, onSelectMetric }: KpiMetricDialogProps) {
  const [metricName, setMetricName] = useState<string>(selectedMetric || "");
  const [metricValue, setMetricValue] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { tenant } = useTenant();

  const predefinedMetrics = [
    "Website Visitors",
    "Conversion Rate",
    "Revenue",
    "Customer Satisfaction",
    "Churn Rate",
    "Active Users",
    "Lead Generation"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tenant?.id) {
      toast.error("No active workspace selected");
      return;
    }
    
    if (!metricName.trim()) {
      toast.error("Please enter a metric name");
      return;
    }
    
    const numValue = parseFloat(metricValue);
    if (isNaN(numValue)) {
      toast.error("Please enter a valid numeric value");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('kpi_metrics')
        .insert({
          tenant_id: tenant.id,
          metric: metricName,
          kpi_name: metricName,
          value: numValue,
          recorded_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      toast.success("KPI metric added successfully");
      setMetricName("");
      setMetricValue("");
      onOpenChange(false);
      
    } catch (error) {
      console.error("Error adding KPI metric:", error);
      toast.error("Failed to add KPI metric");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPredefined = (value: string) => {
    setMetricName(value);
    onSelectMetric(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add KPI Metric</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metricType">Metric Type</Label>
            <Select 
              value={metricName} 
              onValueChange={handleSelectPredefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select or type a metric" />
              </SelectTrigger>
              <SelectContent>
                {predefinedMetrics.map(metric => (
                  <SelectItem key={metric} value={metric}>{metric}</SelectItem>
                ))}
                <SelectItem value="custom">Custom Metric</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {metricName === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customMetric">Custom Metric Name</Label>
              <Input
                id="customMetric"
                value={metricName === 'custom' ? '' : metricName}
                onChange={(e) => setMetricName(e.target.value)}
                placeholder="Enter custom metric name"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="metricValue">Current Value</Label>
            <Input
              id="metricValue"
              type="number"
              value={metricValue}
              onChange={(e) => setMetricValue(e.target.value)}
              placeholder="Enter current value"
              required
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !metricName || !metricValue}
            >
              {isSubmitting ? "Adding..." : "Add Metric"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Add named export
export { KpiMetricDialog };
