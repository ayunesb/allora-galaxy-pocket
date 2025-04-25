
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState() {
  return (
    <div>
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}
