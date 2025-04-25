
import { toast } from "sonner";

// Define toast options that match sonner's API
interface ToastOptions {
  description?: string;
  duration?: number;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  id?: string | number;
}

// Create standardized toast functions
export const showToast = {
  default: (title: string, options?: ToastOptions) => {
    toast(title, options);
  },
  success: (title: string, options?: ToastOptions) => {
    toast.success(title, options);
  },
  error: (title: string, options?: ToastOptions) => {
    toast.error(title, options);
  },
  warning: (title: string, options?: ToastOptions) => {
    toast.warning(title, options);
  },
  info: (title: string, options?: ToastOptions) => {
    toast.info(title, options);
  },
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  },
};
