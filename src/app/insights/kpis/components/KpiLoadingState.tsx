
import { Loader2 } from "lucide-react";

export default function KpiLoadingState() {
  return (
    <div className="container mx-auto py-8 px-4 flex justify-center items-center h-64">
      <div className="flex flex-col items-center">
        <Loader2 className="animate-spin h-8 w-8 mb-2" />
        <p className="text-muted-foreground">Loading KPI metrics...</p>
      </div>
    </div>
  );
}
