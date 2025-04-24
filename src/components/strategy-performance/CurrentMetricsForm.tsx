
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";

interface CurrentMetricsFormProps {
  metrics: Record<string, number>;
  newMetricName: string;
  newMetricValue: string;
  setNewMetricName: (value: string) => void;
  setNewMetricValue: (value: string) => void;
  addMetric: () => void;
  removeMetric: (key: string) => void;
}

export function CurrentMetricsForm({
  metrics,
  newMetricName,
  newMetricValue,
  setNewMetricName,
  setNewMetricValue,
  addMetric,
  removeMetric
}: CurrentMetricsFormProps) {
  const metricKeys = Object.keys(metrics);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {metricKeys.length > 0 ? (
          metricKeys.map(key => (
            <div key={key} className="border rounded-md p-3 flex justify-between items-center">
              <div>
                <div className="font-medium">{key}</div>
                <div className="text-2xl">{metrics[key]}</div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => removeMetric(key)}
                className="text-red-500 hover:text-red-700 hover:bg-red-100"
              >
                Remove
              </Button>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground col-span-2 text-center py-4">
            No metrics added yet. Add your first metric below.
          </p>
        )}
      </div>
      
      <div className="flex gap-2 mt-4">
        <div className="flex-1">
          <Label htmlFor="metric-name">Metric Name</Label>
          <Input
            id="metric-name"
            placeholder="e.g., Conversions"
            value={newMetricName}
            onChange={(e) => setNewMetricName(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="metric-value">Value</Label>
          <Input
            id="metric-value"
            placeholder="e.g., 1250"
            value={newMetricValue}
            onChange={(e) => setNewMetricValue(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button 
            onClick={addMetric}
            disabled={!newMetricName || !newMetricValue}
            className="mb-0"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}
