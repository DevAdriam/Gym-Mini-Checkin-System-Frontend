import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

interface MutationConfig<TData, TError, TVariables, TContext> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables, context: TContext) => void;
  onError?: (error: TError, variables: TVariables, context: TContext) => void;
  successMessage?: string;
  errorMessage?: string;
  invalidateQueries?: string[][];
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

/**
 * Reusable hook for async mutations with automatic toast notifications
 * @param config - Mutation configuration
 * @returns Mutation result
 */
export function useAsyncMutate<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
>(
  config: MutationConfig<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> {
  const queryClient = useQueryClient();
  const {
    mutationFn,
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    invalidateQueries = [],
    showSuccessToast = true,
    showErrorToast = true,
  } = config;

  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn,
    onSuccess: (data, variables, context) => {
      // Invalidate queries if specified
      invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });

      // Show success toast
      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }

      // Call custom onSuccess if provided
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      // Show error toast
      if (showErrorToast) {
        const errorMsg =
          errorMessage ||
          (error as Error).message ||
          "An error occurred";
        toast.error(errorMsg);
      }

      // Call custom onError if provided
      if (onError) {
        onError(error, variables, context);
      }
    },
  });
}

