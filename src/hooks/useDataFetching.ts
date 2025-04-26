
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface DataFetchingState<T> {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  data: T | undefined;
  refetch: () => Promise<any>;
  isRefetching: boolean;
}

/**
 * Enhanced hook for data fetching with centralized error handling
 * @param query The React Query result object
 * @returns Standardized data state with error handling
 */
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
      
      // Log error to console for debugging
      console.error("Data fetching error:", error);
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

/**
 * Helper function to create a typed query hook with error handling
 * @param queryFn The API query function
 * @returns A hook that handles loading, error states, and data fetching
 */
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
