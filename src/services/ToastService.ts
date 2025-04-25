
import { toast, ToastOptions } from "sonner";

interface ToastMessage {
  title?: string;
  description?: string;
  message?: string;
}

type ToastParam = string | ToastMessage;

export class ToastService {
  static normalizeParams(params: ToastParam): [string, string | undefined, ToastOptions | undefined] {
    if (typeof params === 'string') {
      return [params, undefined, undefined];
    }
    
    // Handle both message and description formats
    const message = params.title || params.message || '';
    const description = params.description;
    
    return [message, description, {}];
  }
  
  static success(params: ToastParam, options?: ToastOptions) {
    const [message, description, defaultOptions] = this.normalizeParams(params);
    toast.success(message, { ...defaultOptions, ...options, description });
  }
  
  static error(params: ToastParam, options?: ToastOptions) {
    const [message, description, defaultOptions] = this.normalizeParams(params);
    toast.error(message, { ...defaultOptions, ...options, description });
  }
  
  static warning(params: ToastParam, options?: ToastOptions) {
    const [message, description, defaultOptions] = this.normalizeParams(params);
    toast.warning(message, { ...defaultOptions, ...options, description });
  }
  
  static info(params: ToastParam, options?: ToastOptions) {
    const [message, description, defaultOptions] = this.normalizeParams(params);
    toast.info(message, { ...defaultOptions, ...options, description });
  }
}
