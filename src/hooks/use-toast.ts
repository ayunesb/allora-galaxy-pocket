
import { toast, ToastOptions } from "sonner";

export function useToast() {
  return {
    toast,
    success: (message: string, options?: ToastOptions) => toast.success(message, options),
    error: (message: string, options?: ToastOptions) => toast.error(message, options),
    warning: (message: string, options?: ToastOptions) => toast.warning(message, options),
    info: (message: string, options?: ToastOptions) => toast.info(message, options),
  };
}
