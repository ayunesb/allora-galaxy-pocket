
import { toast } from 'sonner';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
}

export class ToastService {
  static success(options: ToastOptions | string) {
    if (typeof options === 'string') {
      toast.success(options);
    } else {
      toast.success(options.title || 'Success', {
        description: options.description,
        duration: options.duration || 3000,
      });
    }
  }

  static error(options: ToastOptions | string) {
    if (typeof options === 'string') {
      toast.error(options);
    } else {
      toast.error(options.title || 'Error', {
        description: options.description,
        duration: options.duration || 5000,
      });
    }
  }

  static info(options: ToastOptions | string) {
    if (typeof options === 'string') {
      toast.info(options);
    } else {
      toast.info(options.title || 'Information', {
        description: options.description,
        duration: options.duration || 3000,
      });
    }
  }

  static warning(options: ToastOptions | string) {
    if (typeof options === 'string') {
      toast.warning(options);
    } else {
      toast.warning(options.title || 'Warning', {
        description: options.description,
        duration: options.duration || 4000,
      });
    }
  }
}
