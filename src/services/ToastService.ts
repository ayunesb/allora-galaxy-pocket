
import { toast } from 'sonner';

type ToastOptions = {
  title: string;
  description?: string;
  duration?: number;
  action?: React.ReactNode;
};

/**
 * Consistent toast service to manage notifications throughout the app
 */
export const ToastService = {
  success: (options: ToastOptions) => {
    toast.success(options.title, {
      description: options.description,
      duration: options.duration || 5000,
      action: options.action,
    });
  },

  error: (options: ToastOptions) => {
    toast.error(options.title, {
      description: options.description,
      duration: options.duration || 8000,
      action: options.action,
    });
  },

  warning: (options: ToastOptions) => {
    toast.warning(options.title, {
      description: options.description,
      duration: options.duration || 5000,
      action: options.action,
    });
  },

  info: (options: ToastOptions) => {
    toast.info(options.title, {
      description: options.description,
      duration: options.duration || 4000,
      action: options.action,
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
    // The toast.promise function in sonner expects only 2 arguments
    return toast.promise(promise, messages);
  },

  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },

  custom: (options: ToastOptions & { variant?: 'default' | 'destructive' | 'success' | 'warning' }) => {
    const { variant = 'default', ...rest } = options;
    
    switch (variant) {
      case 'success':
        return ToastService.success(rest);
      case 'destructive':
        return ToastService.error(rest);
      case 'warning':
        return ToastService.warning(rest);
      default:
        return toast(options.title, {
          description: options.description,
          duration: options.duration || 4000,
          action: options.action,
        });
    }
  }
};
