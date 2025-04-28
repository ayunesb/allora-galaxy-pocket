
import React from 'react';
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function KpiLoadingState() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default KpiLoadingState;
