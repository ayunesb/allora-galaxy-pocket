
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function LoadingState() {
  return (
    <div className="space-y-2 px-2">
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-9 w-full" />
      <div className="mt-2 flex justify-end">
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}
