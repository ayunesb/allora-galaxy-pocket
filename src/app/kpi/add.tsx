
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft, Save, X } from "lucide-react";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

export default function AddKpiPage() {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const { logActivity } = useSystemLogs();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metricName, setMetricName] = useState("");
  const [metricValue, setMetricValue] = useState("");
  const [metricType, setMetricType] = useState<string>("numeric");
  
  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tenant?.id) {
      toast("Missing workspace", {
        description: "Please select a workspace first",
        variant: "destructive"
      });
      return;
    }
    
    if (!metricName.trim()) {
      toast("Missing metric name", {
        description: "Please provide a name for this metric",
        variant: "destructive"
      });
      return;
    }
    
    if (!metricValue.trim()) {
      toast("Missing value", {
        description: "Please provide a value for this metric",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Convert value based on type
      let parsedValue: number;
      
      if (metricType === "percentage") {
        // Remove % if present and convert to decimal
        parsedValue = parseFloat(metricValue.replace('%', '')) / 100;
      } else {
        // Regular numeric value
        parsedValue = parseFloat(metricValue);
      }
      
      if (isNaN(parsedValue)) {
        throw new Error("Invalid numeric value");
      }
      
      // Add the KPI metric
      const { data, error } = await supabase
        .from('kpi_metrics')
        .insert({
          tenant_id: tenant.id,
          metric: metricName,
          value: parsedValue,
          metadata: { type: metricType }
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Log the activity
      await logActivity({
        event_type: "KPI_METRIC_ADDED",
        message: `KPI metric "${metricName}" added with value ${metricValue}`,
        meta: {
          metric_name: metricName,
          metric_value: parsedValue,
          metric_type: metricType
        }
      });
      
      toast("Metric added", {
        description: "Your KPI metric has been added successfully"
      });
      
      // Navigate back to the dashboard
      navigate("/kpi/dashboard");
      
    } catch (err: any) {
      console.error("Error adding KPI metric:", err);
      setError(err.message || "Failed to add KPI metric");
      toast("Metric addition failed", {
        description: err.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const metricTypes = [
    { value: "numeric", label: "Numeric" },
    { value: "percentage", label: "Percentage" },
    { value: "currency", label: "Currency" },
  ];
  
  const commonMetrics = [
    { name: "Conversion Rate", type: "percentage" },
    { name: "Revenue", type: "currency" },
    { name: "Leads Generated", type: "numeric" },
    { name: "Engagement Rate", type: "percentage" },
    { name: "Churn Rate", type: "percentage" },
    { name: "Customer Acquisition Cost", type: "currency" },
    { name: "Average Order Value", type: "currency" },
  ];
  
  const handleQuickAdd = (metric: { name: string, type: string }) => {
    setMetricName(metric.name);
    setMetricType(metric.type);
    // Focus on the value input
    document.getElementById("metric-value")?.focus();
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl space-y-8">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/kpi/dashboard")}
          className="flex items-center gap-1 mr-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add KPI Metric</h1>
          <p className="text-muted-foreground">Track a new performance indicator</p>
        </div>
      </div>
      
      <LoadingOverlay show={loading} label="Adding metric..." />
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleAddMetric}>
        <Card>
          <CardHeader>
            <CardTitle>New Metric Details</CardTitle>
            <CardDescription>
              Define a key performance indicator to track
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="metric-name">Metric Name</Label>
              <Input
                id="metric-name"
                value={metricName}
                onChange={(e) => setMetricName(e.target.value)}
                placeholder="e.g. Conversion Rate, Revenue, etc."
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="metric-type">Metric Type</Label>
              <Select
                value={metricType}
                onValueChange={(value) => setMetricType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select metric type" />
                </SelectTrigger>
                <SelectContent>
                  {metricTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="metric-value">Current Value</Label>
              <Input
                id="metric-value"
                value={metricValue}
                onChange={(e) => setMetricValue(e.target.value)}
                placeholder={
                  metricType === "percentage" ? "e.g. 12.5" :
                  metricType === "currency" ? "e.g. 1000" : "e.g. 42"
                }
                type="number"
                step="any"
                required
              />
              <p className="text-xs text-muted-foreground">
                {metricType === "percentage" 
                  ? "Enter as a decimal (e.g., 12.5 for 12.5%)" 
                  : metricType === "currency"
                  ? "Enter the amount without currency symbols"
                  : "Enter a numeric value"
                }
              </p>
            </div>
            
            <div className="pt-4 border-t space-y-3">
              <Label>Quick Add Common Metrics</Label>
              <div className="flex flex-wrap gap-2">
                {commonMetrics.map((metric) => (
                  <Button
                    key={metric.name}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAdd(metric)}
                    className="flex items-center gap-1"
                  >
                    {metric.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/kpi/dashboard")}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!metricName.trim() || !metricValue.trim() || loading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" /> Save Metric
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
