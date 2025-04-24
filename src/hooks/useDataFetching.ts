
import { UseQueryResult } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import { useState, useEffect } from "react";

interface DataFetchingState<T> {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  data: T | undefined;
  refetch: () => Promise<any>;
  isRefetching: boolean;
}

export function useDataFetching<T>(query: UseQueryResult<T, Error>): DataFetchingState<T> {
  const { isLoading, isError, error, data, refetch, isRefetching } = query;
  const [hasShownError, setHasShownError] = useState(false);

  // Show error toast once when an error occurs
  useEffect(() => {
    if (isError && error && !hasShownError) {
      toast.error("Error fetching data", {
        description: error.message,
        action: {
          label: "Retry",
          onClick: () => refetch()
        }
      });
      setHasShownError(true);
    }
    
    // Reset flag when error is resolved
    if (!isError && hasShownError) {
      setHasShownError(false);
    }
  }, [isError, error, hasShownError, refetch]);

  return {
    isLoading,
    isError,
    error: error || null,
    data,
    refetch,
    isRefetching
  };
}

// Helper hook to wrap around useQuery with better error handling
export function createQueryHook<TParams, TResult>(
  queryFn: (params: TParams) => Promise<TResult>
) {
  return (params: TParams, queryKey: unknown[], options = {}) => {
    return useDataFetching(
      useQuery({
        queryKey,
        queryFn: () => queryFn(params),
        ...options,
      })
    );
  };
}
