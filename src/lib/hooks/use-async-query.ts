import { useEffect } from "react";
import { useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import toast from "react-hot-toast";

/**
 * Reusable hook for async queries with automatic error handling
 * @param options - React Query options
 * @param showErrorToast - Whether to show error toast (default: true, skips for 401)
 * @returns Query result
 */
export function useAsyncQuery<TData = unknown, TError = Error>(
  options: UseQueryOptions<TData, TError>,
  showErrorToast: boolean = true
): UseQueryResult<TData, TError> {
  const query = useQuery<TData, TError>({
    ...options,
    retry: false,
  });

  // Handle errors with toast notifications
  useEffect(() => {
    if (query.isError && query.error && showErrorToast) {
      const error = query.error as Error & { statusCode?: number };
      // Don't show toast for 401 errors (handled by axios interceptor)
      if (error.statusCode !== 401) {
        toast.error(error.message || "An error occurred");
      }
    }
  }, [query.isError, query.error, showErrorToast]);

  return query;
}

