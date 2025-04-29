
import { ToastService } from "@/services/ToastService";
import { toast } from 'sonner';

// Helper function to ensure valid React child (not an object)
function ensureValidReactChild(value: any): string | React.ReactNode {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object' && !React.isValidElement(value)) {
    return JSON.stringify(value);
  }
  return value;
}

/**
 * Standardized toast utilities that wrap the ToastService 
 * for convenient usage across the application
 */
export const showToast = {
  success: (title: string, options?: { description?: string | React.ReactNode, duration?: number }) => {
    ToastService.success({
      title,
      description: options?.description ? ensureValidReactChild(options.description) : undefined,
      duration: options?.duration
    });
  },
  
  error: (title: string, options?: { description?: string | React.ReactNode, duration?: number }) => {
    ToastService.error({
      title,
      description: options?.description ? ensureValidReactChild(options.description) : undefined,
      duration: options?.duration
    });
  },
  
  warning: (title: string, options?: { description?: string | React.ReactNode, duration?: number }) => {
    ToastService.warning({
      title,
      description: options?.description ? ensureValidReactChild(options.description) : undefined,
      duration: options?.duration
    });
  },
  
  info: (title: string, options?: { description?: string | React.ReactNode, duration?: number }) => {
    ToastService.info({
      title,
      description: options?.description ? ensureValidReactChild(options.description) : undefined,
      duration: options?.duration
    });
  },
  
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
      description?: string | React.ReactNode;
    }
  ) => {
    return ToastService.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      description: messages.description ? ensureValidReactChild(messages.description) : undefined
    });
  },
  
  api: {
    error: (error: unknown, title: string = "API Error") => {
      let message = "Unknown error occurred";
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        message = String(error.message);
      }
      
      ToastService.error({
        title,
        description: message
      });
      
      console.error(`API Error (${title}):`, error);
    },
    
    networkError: (error: unknown) => {
      ToastService.network(error, {
        title: "Connection Error",
        description: "Please check your internet connection and try again"
      });
    }
  }
};

/**
 * Safe wrapper for async functions that shows toast messages on error
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorMessage: string = "An error occurred"
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      showToast.api.error(error, errorMessage);
      throw error;
    }
  };
}

/**
 * Creates a version of a function that will display a loading toast while running
 * and show success/error toasts based on the result
 */
export function withLoadingToast<T extends (...args: any[]) => Promise<any>>(
  fn: T, 
  messages: {
    loading: string;
    success: string;
    error: string;
  }
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const toastId = ToastService.loading({
      title: messages.loading
    });
    
    try {
      const result = await fn(...args);
      ToastService.success({
        title: messages.success,
        id: toastId
      });
      return result;
    } catch (error) {
      ToastService.error({
        title: messages.error,
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        id: toastId
      });
      throw error;
    }
  };
}
