
import { ToastService } from "@/services/ToastService";

/**
 * Standardized toast utilities that wrap the ToastService 
 * for convenient usage across the application
 */
export const showToast = {
  success: (title: string, options?: { description?: string, duration?: number }) => {
    ToastService.success({
      title,
      description: options?.description,
      duration: options?.duration
    });
  },
  
  error: (title: string, options?: { description?: string, duration?: number }) => {
    ToastService.error({
      title,
      description: options?.description,
      duration: options?.duration
    });
  },
  
  warning: (title: string, options?: { description?: string, duration?: number }) => {
    ToastService.warning({
      title,
      description: options?.description,
      duration: options?.duration
    });
  },
  
  info: (title: string, options?: { description?: string, duration?: number }) => {
    ToastService.info({
      title,
      description: options?.description,
      duration: options?.duration
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
    return ToastService.promise(promise, messages);
  }
};
