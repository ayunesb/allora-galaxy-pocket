
import { toast, ToastT } from 'sonner';

export type ToastOptions = {
  title?: string;
  description?: React.ReactNode | string;
  duration?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  [key: string]: any;
};

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

export const ToastService = {
  show: (options: ToastOptions | string) => {
    if (typeof options === 'string') {
      return toast(options);
    }
    
    const { title = '', description, ...rest } = options;
    return toast(title, {
      description: sanitizeDescription(description),
      ...rest
    });
  },
  
  success: (options: ToastOptions | string) => {
    if (typeof options === 'string') {
      return toast.success(options);
    }
    
    const { title = '', description, ...rest } = options;
    return toast.success(title, {
      description: sanitizeDescription(description),
      ...rest
    });
  },
  
  error: (options: ToastOptions | string) => {
    if (typeof options === 'string') {
      return toast.error(options);
    }
    
    const { title = '', description, ...rest } = options;
    return toast.error(title, {
      description: sanitizeDescription(description),
      ...rest
    });
  },
  
  warning: (options: ToastOptions | string) => {
    if (typeof options === 'string') {
      return toast.warning(options);
    }
    
    const { title = '', description, ...rest } = options;
    return toast.warning(title, {
      description: sanitizeDescription(description),
      ...rest
    });
  },
  
  info: (options: ToastOptions | string) => {
    if (typeof options === 'string') {
      return toast.info(options);
    }
    
    const { title = '', description, ...rest } = options;
    return toast.info(title, {
      description: sanitizeDescription(description),
      ...rest
    });
  },
  
  // Legacy method - directly use the toast function
  message: (message: string) => toast(message)
};

export default ToastService;
