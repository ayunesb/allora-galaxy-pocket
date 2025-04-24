
import { UseQueryResult } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";

interface DataFetchingState<T> {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  data: T | undefined;
}

export function useDataFetching<T>(query: UseQueryResult<T, Error>): DataFetchingState<T> {
  const { isLoading, isError, error, data } = query;

  if (isError && error) {
    toast.error("Error fetching data", {
      description: error.message
    });
  }

  return {
    isLoading,
    isError,
    error: error || null,
    data
  };
}
