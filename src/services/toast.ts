
import { toast } from "sonner";

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
}

/**
 * Standardized toast service to ensure consistent toast notifications across the application
 */
export class ToastService {
  private static defaultDuration = 5000;

  /**
   * Show a success toast notification
   */
  static success({ title, description, duration }: ToastOptions) {
    toast.success(title, {
      description,
      duration: duration || this.defaultDuration,
    });
  }

  /**
   * Show an error toast notification
   */
  static error({ title, description, duration }: ToastOptions) {
    toast.error(title, {
      description,
      duration: duration || this.defaultDuration,
    });
  }

  /**
   * Show a warning toast notification
   */
  static warning({ title, description, duration }: ToastOptions) {
    toast.warning(title, {
      description,
      duration: duration || this.defaultDuration,
    });
  }

  /**
   * Show an informational toast notification
   */
  static info({ title, description, duration }: ToastOptions) {
    toast.info(title, {
      description,
      duration: duration || this.defaultDuration,
    });
  }

  /**
   * Show a promise toast notification
   */
  static promise<T>(
    promise: Promise<T>,
    {
      loading = "Loading...",
      success = "Completed successfully",
      error = "Something went wrong"
    }: {
      loading?: string;
      success?: string;
      error?: string;
    }
  ) {
    toast.promise(promise, {
      loading,
      success,
      error,
    });
  }
}
