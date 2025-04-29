
import { toast, ToastT } from 'sonner';

interface ToastOptions {
  title?: string;
  description?: React.ReactNode | string;
  duration?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  [key: string]: any;
}

// Safely convert any description to an acceptable format
function sanitizeDescription(description: any): string | React.ReactNode {
  if (description === undefined || description === null) {
    return '';
  }
  
  // If it's already a string or ReactNode, return it directly
  if (typeof description === 'string' || React.isValidElement(description)) {
    return description;
  }
  
  try {
    return JSON.stringify(description);
  } catch (e) {
    return 'Invalid description format';
  }
}

// Helper to adapt to sonner's API
function createToast(type: 'default' | 'success' | 'error' | 'warning' | 'info', options: ToastOptions | string) {
  if (typeof options === 'string') {
    return toast[type](options);
  }
  
  const { title = '', description, ...rest } = options;
  
  return toast[type](title, {
    description: sanitizeDescription(description),
    ...rest
  });
}

export const ToastService = {
  show: (options: ToastOptions | string) => createToast('default', options),
  success: (options: ToastOptions | string) => createToast('success', options),
  error: (options: ToastOptions | string) => createToast('error', options),
  warning: (options: ToastOptions | string) => createToast('warning', options),
  info: (options: ToastOptions | string) => createToast('info', options),
  
  // Legacy method - directly use the toast function
  message: (message: string) => toast(message)
};

export default ToastService;
