
import { toast, ToastT } from "sonner";

interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
  id?: string | number;
  position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
}

export class ToastService {
  static success(options: ToastOptions): string | number {
    return toast.success(options.title, {
      description: options.description,
      duration: options.duration || 4000,
      id: options.id,
      position: options.position
    });
  }
  
  static error(options: ToastOptions): string | number {
    // Log errors to console for debugging
    console.error(`Toast Error: ${options.title}${options.description ? ` - ${options.description}` : ''}`);
    
    return toast.error(options.title, {
      description: options.description,
      duration: options.duration || 5000,
      id: options.id,
      position: options.position
    });
  }
  
  static info(options: ToastOptions): string | number {
    return toast.info(options.title, {
      description: options.description,
      duration: options.duration || 3000,
      id: options.id,
      position: options.position
    });
  }
  
  static warning(options: ToastOptions): string | number {
    return toast.warning(options.title, {
      description: options.description,
      duration: options.duration || 4000,
      id: options.id,
      position: options.position
    });
  }
  
  static loading(options: ToastOptions): string | number {
    return toast.loading(options.title, {
      description: options.description,
      id: options.id,
      position: options.position
    });
  }
  
  static dismiss(toastId?: string | number): void {
    toast.dismiss(toastId);
  }
  
  static promise<T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
      description?: string;
      id?: string | number;
      position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
    }
  ): Promise<T> {
    return toast.promise(promise, {
      loading: options.loading,
      success: options.success,
      error: options.error,
      description: options.description,
      id: options.id,
      position: options.position
    });
  }
  
  static custom(options: ToastOptions & { icon?: React.ReactNode }): string | number {
    return toast(options.title, {
      description: options.description,
      duration: options.duration || 4000,
      id: options.id,
      position: options.position,
      icon: options.icon
    });
  }
  
  static network(error: unknown, options?: Partial<ToastOptions>): string | number {
    let message = "Network error";
    
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }
    
    return this.error({
      title: options?.title || "Connection problem",
      description: options?.description || message,
      duration: options?.duration || 5000,
      id: options?.id,
      position: options?.position
    });
  }
}
