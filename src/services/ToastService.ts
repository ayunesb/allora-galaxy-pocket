
import { ToastActionElement } from '@/components/ui/toast';
import { toast } from '@/components/ui/sonner';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  title: string;
  description?: string;
  action?: ToastActionElement;
  duration?: number;  // in milliseconds
}

/**
 * A standardized toast notification service for use throughout the application.
 * This ensures consistent toast behavior and styling across all modules.
 */
export class ToastService {
  /**
   * Shows a success toast notification
   */
  static success(options: ToastOptions) {
    const { title, description, action, duration } = options;
    toast.success(title, {
      description,
      action,
      duration: duration || 5000
    });
  }

  /**
   * Shows an error toast notification
   */
  static error(options: ToastOptions) {
    const { title, description, action, duration } = options;
    toast.error(title, {
      description,
      action,
      duration: duration || 8000
    });
  }

  /**
   * Shows an info toast notification
   */
  static info(options: ToastOptions) {
    const { title, description, action, duration } = options;
    toast.info(title, {
      description,
      action,
      duration: duration || 4000
    });
  }

  /**
   * Shows a warning toast notification
   */
  static warning(options: ToastOptions) {
    const { title, description, action, duration } = options;
    toast.warning(title, {
      description,
      action,
      duration: duration || 6000
    });
  }

  /**
   * Shows a custom type toast notification
   */
  static show(type: ToastType, options: ToastOptions) {
    switch (type) {
      case 'success':
        this.success(options);
        break;
      case 'error':
        this.error(options);
        break;
      case 'info':
        this.info(options);
        break;
      case 'warning':
        this.warning(options);
        break;
      default:
        toast(options.title, {
          description: options.description,
          action: options.action,
          duration: options.duration || 5000
        });
    }
  }

  /**
   * Dismisses all currently visible toasts
   */
  static dismissAll() {
    toast.dismiss();
  }
}

/**
 * A hook for using toast throughout the application
 * @returns The ToastService class for showing toasts
 */
export function useToastService() {
  return ToastService;
}
