
import { Loader2 } from "lucide-react";

export default function KpiLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 w-full">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Loading KPI metrics...</p>
    </div>
  );
}
