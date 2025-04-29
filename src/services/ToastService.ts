
import { toast } from "sonner";

type ToastOptions = {
  description?: string | React.ReactNode;
  duration?: number;
  id?: string | number;
  position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
};

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

  static success(message: string, options?: ToastOptions): string | number {
    const safeDescription = options?.description ? this.ensureValidReactChild(options.description) : undefined;
    return toast.success(message, {
      description: safeDescription,
      duration: options?.duration || 4000,
      id: options?.id,
      position: options?.position
    });
  }
  
  static error(message: string, options?: ToastOptions): string | number {
    // Log errors to console for debugging
    console.error(`Toast Error: ${message}${options?.description ? ` - ${options.description}` : ''}`);
    
    const safeDescription = options?.description ? this.ensureValidReactChild(options.description) : undefined;
    return toast.error(message, {
      description: safeDescription,
      duration: options?.duration || 5000,
      id: options?.id,
      position: options?.position
    });
  }
  
  static info(message: string, options?: ToastOptions): string | number {
    const safeDescription = options?.description ? this.ensureValidReactChild(options.description) : undefined;
    return toast.info(message, {
      description: safeDescription,
      duration: options?.duration || 3000,
      id: options?.id,
      position: options?.position
    });
  }
  
  static warning(message: string, options?: ToastOptions): string | number {
    const safeDescription = options?.description ? this.ensureValidReactChild(options.description) : undefined;
    return toast.warning(message, {
      description: safeDescription,
      duration: options?.duration || 4000,
      id: options?.id,
      position: options?.position
    });
  }
  
  static loading(message: string, options?: ToastOptions): string | number {
    const safeDescription = options?.description ? this.ensureValidReactChild(options.description) : undefined;
    return toast.loading(message, {
      description: safeDescription,
      id: options?.id,
      position: options?.position
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
    const safeDescription = options.description ? this.ensureValidReactChild(options.description) : undefined;
    return toast.promise(promise, {
      loading: options.loading,
      success: options.success,
      error: options.error,
      description: safeDescription,
      id: options.id,
      position: options.position
    });
  }
  
  static custom(message: string, options?: ToastOptions & { icon?: React.ReactNode }): string | number {
    const safeDescription = options?.description ? this.ensureValidReactChild(options.description) : undefined;
    return toast(message, {
      description: safeDescription,
      duration: options?.duration || 4000,
      id: options?.id,
      position: options?.position,
      icon: options?.icon
    });
  }
  
  static network(error: unknown, options?: ToastOptions & { title?: string }): string | number {
    let message = "Network error";
    
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      message = String(error.message);
    }
    
    const safeDescription = options?.description ? this.ensureValidReactChild(options.description) : message;
    return this.error(options?.title || "Connection problem", {
      description: safeDescription,
      duration: options?.duration || 5000,
      id: options?.id,
      position: options?.position
    });
  }
}
