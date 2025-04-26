import { toast } from "sonner";

interface ToastOptions {
  duration?: number;
  id?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  description?: string;
  icon?: React.ReactNode;
}

/**
 * Displays a success toast notification
 * @param message The main success message to display
 * @param options Additional configuration options
 */
export const showSuccess = (message: string, options?: ToastOptions) => {
  return toast.success(message, options);
};

/**
 * Displays an error toast notification
 * @param message The error message to display
 * @param options Additional configuration options
 */
export const showError = (message: string, options?: ToastOptions) => {
  return toast.error(message, options);
};

/**
 * Displays an informational toast notification
 * @param message The information message to display
 * @param options Additional configuration options
 */
export const showInfo = (message: string, options?: ToastOptions) => {
  return toast(message, options);
};

/**
 * Displays a warning toast notification
 * @param message The warning message to display
 * @param options Additional configuration options
 */
export const showWarning = (message: string, options?: ToastOptions) => {
  return toast.warning(message, options);
};

/**
 * Displays a promise-based loading toast that resolves to success or error
 * @param promise The promise to track
 * @param messages Object containing loading, success, and error messages
 * @param options Additional configuration options
 */
export const showPromise = (
  promise: Promise<any>,
  messages: { 
    loading: string; 
    success: string; 
    error: string;
  },
  options?: ToastOptions
) => {
  return toast.promise(promise, messages, options);
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
