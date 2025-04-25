
import { toast, ToastOptions } from "sonner";

interface ToastParams {
  title: string;
  description?: string;
}

type ToastOptionsType = Omit<ToastOptions, 'description'>;

export class ToastService {
  static success({ title, description }: ToastParams, options?: ToastOptionsType) {
    return toast.success(title, { 
      description, 
      ...options 
    });
  }

  static error({ title, description }: ToastParams, options?: ToastOptionsType) {
    return toast.error(title, { 
      description, 
      ...options 
    });
  }

  static warning({ title, description }: ToastParams, options?: ToastOptionsType) {
    return toast.warning(title, { 
      description, 
      ...options 
    });
  }

  static info({ title, description }: ToastParams, options?: ToastOptionsType) {
    return toast.info(title, { 
      description, 
      ...options 
    });
  }
}
