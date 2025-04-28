
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";

interface KpiMetricDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMetric: string | null;
  onSelectMetric: (metric: string | null) => void;
}

export default function KpiMetricDialog({ 
  open, 
  onOpenChange, 
  selectedMetric,
  onSelectMetric
}: KpiMetricDialogProps) {
  const [metricName, setMetricName] = useState(selectedMetric || "");
  const [metricValue, setMetricValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { tenant } = useTenant();
  
  const handleSubmit = async () => {
    if (!metricName || !metricValue || !tenant?.id) {
      toast.error("Please fill all required fields");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const numericValue = parseFloat(metricValue);
      if (isNaN(numericValue)) {
        throw new Error("Value must be a number");
      }
      
      const { error } = await supabase
        .from("kpi_metrics")
        .insert({
          metric: metricName,
          value: numericValue,
          tenant_id: tenant.id
        });
        
      if (error) throw error;
      
      toast.success("Metric added successfully");
      reset();
      onOpenChange(false);
      // Force a refresh of the page to show the new metric
      window.location.reload();
    } catch (error) {
      console.error("Error adding metric:", error);
      toast.error("Failed to add metric");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const reset = () => {
    setMetricName("");
    setMetricValue("");
    onSelectMetric(null);
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) reset();
      onOpenChange(isOpen);
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add KPI Metric</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Metric Name</label>
            <Select value={metricName} onValueChange={setMetricName}>
              <SelectTrigger>
                <SelectValue placeholder="Select a metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Revenue">Revenue</SelectItem>
                <SelectItem value="Conversion Rate">Conversion Rate</SelectItem>
                <SelectItem value="Customer Acquisition Cost">CAC</SelectItem>
                <SelectItem value="Churn Rate">Churn Rate</SelectItem>
                <SelectItem value="MRR">MRR</SelectItem>
                <SelectItem value="ARR">ARR</SelectItem>
                <SelectItem value="Active Users">Active Users</SelectItem>
                <SelectItem value="Leads Generated">Leads Generated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Value</label>
            <Input
              type="number"
              placeholder="Enter metric value"
              value={metricValue}
              onChange={(e) => setMetricValue(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Metric"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
