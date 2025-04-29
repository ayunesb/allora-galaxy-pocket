
import { toast } from "sonner";

interface ToastOptions {
  duration?: number;
  id?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  description?: string | React.ReactNode;
  icon?: React.ReactNode;
}

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
 * Displays a success toast notification
 * @param message The main success message to display
 * @param options Additional configuration options
 */
export const showSuccess = (message: string, options?: ToastOptions) => {
  return toast.success(message, {
    ...options,
    description: options?.description ? ensureValidReactChild(options.description) : undefined
  });
};

/**
 * Displays an error toast notification
 * @param message The error message to display
 * @param options Additional configuration options
 */
export const showError = (message: string, options?: ToastOptions) => {
  return toast.error(message, {
    ...options,
    description: options?.description ? ensureValidReactChild(options.description) : undefined
  });
};

/**
 * Displays an informational toast notification
 * @param message The information message to display
 * @param options Additional configuration options
 */
export const showInfo = (message: string, options?: ToastOptions) => {
  return toast(message, {
    ...options,
    description: options?.description ? ensureValidReactChild(options.description) : undefined
  });
};

/**
 * Displays a warning toast notification
 * @param message The warning message to display
 * @param options Additional configuration options
 */
export const showWarning = (message: string, options?: ToastOptions) => {
  return toast.warning(message, {
    ...options,
    description: options?.description ? ensureValidReactChild(options.description) : undefined
  });
};

/**
 * Displays a promise-based loading toast that resolves to success or error
 * @param promise The promise to track
 * @param messages Object containing loading, success, and error messages
 * @param options Additional configuration options
 */
export const showPromise = <T>(
  promise: Promise<T>,
  messages: { 
    loading: string; 
    success: string | ((data: T) => string); 
    error: string | ((error: unknown) => string);
  },
  options?: ToastOptions
) => {
  // The toast.promise API accepts only two arguments: the promise and the messages object
  // The options can be passed as part of the messages object
  return toast.promise(promise, {
    ...messages,
    ...options,
    description: options?.description ? ensureValidReactChild(options.description) : undefined
  });
};

/**
 * Dismisses a specific toast by ID
 * @param toastId The ID of the toast to dismiss
 */
export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

/**
 * Dismisses all active toast notifications
 */
export const dismissAllToasts = () => {
  toast.dismiss();
};
