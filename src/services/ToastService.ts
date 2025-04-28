
import { toast } from "sonner";

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const ToastService = {
  /**
   * Show a success toast notification
   */
  success: (options: ToastOptions) => {
    return toast.success(options.title, {
      description: options.description,
      duration: options.duration,
      action: options.action
    });
  },

  /**
   * Show an error toast notification
   */
  error: (options: ToastOptions) => {
    return toast.error(options.title, {
      description: options.description,
      duration: options.duration || 5000,
      action: options.action
    });
  },

  /**
   * Show an information toast notification
   */
  info: (options: ToastOptions) => {
    return toast(options.title, {
      description: options.description,
      duration: options.duration,
      action: options.action
    });
  },

  /**
   * Show a warning toast notification
   */
  warning: (options: ToastOptions) => {
    return toast.warning(options.title, {
      description: options.description,
      duration: options.duration,
      action: options.action
    });
  },

  /**
   * Show a promise toast notification
   */
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => {
    return toast.promise(promise, options);
  }
};
