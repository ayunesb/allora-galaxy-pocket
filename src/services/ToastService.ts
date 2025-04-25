
import { toast } from 'sonner';

type ToastOptions = {
  title: string;
  description?: string;
  duration?: number;
};

/**
 * Consistent toast service to manage notifications throughout the app
 */
export const ToastService = {
  success: (options: ToastOptions) => {
    toast.success(options.title, {
      description: options.description,
      duration: options.duration || 5000
    });
  },

  error: (options: ToastOptions) => {
    toast.error(options.title, {
      description: options.description,
      duration: options.duration || 8000
    });
  },

  warning: (options: ToastOptions) => {
    toast.warning(options.title, {
      description: options.description,
      duration: options.duration || 5000
    });
  },

  info: (options: ToastOptions) => {
    toast.info(options.title, {
      description: options.description,
      duration: options.duration || 4000
    });
  },

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading?: string;
      success?: string | ((data: T) => string);
      error?: string | ((error: unknown) => string);
    }
  ) => {
    return toast.promise(promise, messages);
  }
};
