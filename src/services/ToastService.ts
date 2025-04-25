
import { toast } from "@/hooks/use-toast";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

/**
 * Standardized toast service to ensure consistent toast notifications across the application
 */
export class ToastService {
  /**
   * Show a success toast notification
   */
  static success(options: ToastOptions) {
    toast({
      title: options.title,
      description: options.description,
      variant: 'default',
      duration: options.duration || 3000
    });
  }

  /**
   * Show an error toast notification
   */
  static error(options: ToastOptions) {
    toast({
      title: options.title,
      description: options.description,
      variant: 'destructive',
      duration: options.duration || 5000
    });
  }

  /**
   * Show an informational toast notification
   */
  static info(options: ToastOptions) {
    toast({
      title: options.title,
      description: options.description,
      variant: 'default',
      duration: options.duration || 4000
    });
  }

  /**
   * Show a warning toast notification
   */
  static warning(options: ToastOptions) {
    toast({
      title: options.title,
      description: options.description || '',
      variant: 'destructive',
      duration: options.duration || 4000
    });
  }
}
