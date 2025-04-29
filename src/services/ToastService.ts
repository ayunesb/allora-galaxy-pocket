
import { toast, ToastT } from "sonner";

interface ToastOptions {
  title: string;
  description?: string | React.ReactNode;
  duration?: number;
  id?: string | number;
  position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
}

export class ToastService {
  // Helper method to ensure value is a valid React child (not an object)
  private static ensureValidReactChild(value: any): string | React.ReactNode {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'object' && !React.isValidElement(value)) {
      try {
        return JSON.stringify(value);
      } catch (e) {
        return String(value);
      }
    }
    return value;
  }

  static success(options: ToastOptions): string | number {
    const safeDescription = this.ensureValidReactChild(options.description);
    return toast.success(options.title, {
      description: safeDescription,
      duration: options.duration || 4000,
      id: options.id,
      position: options.position
    });
  }
  
  static error(options: ToastOptions): string | number {
    // Log errors to console for debugging
    console.error(`Toast Error: ${options.title}${options.description ? ` - ${options.description}` : ''}`);
    
    const safeDescription = this.ensureValidReactChild(options.description);
    return toast.error(options.title, {
      description: safeDescription,
      duration: options.duration || 5000,
      id: options.id,
      position: options.position
    });
  }
  
  static info(options: ToastOptions): string | number {
    const safeDescription = this.ensureValidReactChild(options.description);
    return toast.info(options.title, {
      description: safeDescription,
      duration: options.duration || 3000,
      id: options.id,
      position: options.position
    });
  }
  
  static warning(options: ToastOptions): string | number {
    const safeDescription = this.ensureValidReactChild(options.description);
    return toast.warning(options.title, {
      description: safeDescription,
      duration: options.duration || 4000,
      id: options.id,
      position: options.position
    });
  }
  
  static loading(options: ToastOptions): string | number {
    const safeDescription = this.ensureValidReactChild(options.description);
    return toast.loading(options.title, {
      description: safeDescription,
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
      description?: string | React.ReactNode;
      id?: string | number;
      position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
    }
  ): Promise<T> {
    const safeDescription = this.ensureValidReactChild(options.description);
    return toast.promise(promise, {
      loading: options.loading,
      success: options.success,
      error: options.error,
      description: safeDescription,
      id: options.id,
      position: options.position
    });
  }
  
  static custom(options: ToastOptions & { icon?: React.ReactNode }): string | number {
    const safeDescription = this.ensureValidReactChild(options.description);
    return toast(options.title, {
      description: safeDescription,
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
    } else if (error && typeof error === 'object' && 'message' in error) {
      message = String(error.message);
    }
    
    const safeDescription = options?.description ? this.ensureValidReactChild(options.description) : message;
    return this.error({
      title: options?.title || "Connection problem",
      description: safeDescription,
      duration: options?.duration || 5000,
      id: options?.id,
      position: options?.position
    });
  }
}
