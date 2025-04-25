
import { toast } from 'sonner';

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
}

/**
 * Standardized toast utility function that uses sonner under the hood
 */
export function showToast(options: ToastOptions) {
  const { title, description, variant = 'default', duration = 5000 } = options;
  
  switch (variant) {
    case 'success':
      toast.success(title, { description, duration });
      break;
    case 'destructive':
      toast.error(title, { description, duration });
      break;
    case 'warning':
      toast.warning(title, { description, duration });
      break;
    default:
      toast(title, { description, duration });
  }
}
