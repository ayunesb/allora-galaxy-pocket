
import * as React from 'react';
import { toast as sonnerToast, ToastT } from 'sonner';

type ToastProps = {
  title?: string;
  description?: React.ReactNode | string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
  [key: string]: any;
};

function sanitizeToastDescription(description: any): string | React.ReactNode {
  if (description === undefined || description === null) {
    return '';
  }
  
  // If it's already a string or ReactNode, return it directly
  if (typeof description === 'string' || React.isValidElement(description)) {
    return description;
  }
  
  // If it's a simple object, convert to string safely
  if (typeof description === 'object') {
    try {
      return JSON.stringify(description);
    } catch (e) {
      return 'Invalid description format';
    }
  }
  
  // Default case: convert to string
  return String(description);
}

export const useToast = () => {
  const toast = React.useMemo(
    () => ({
      toast: ({ title, description, ...props }: ToastProps) => {
        sonnerToast(title || "", {
          description: sanitizeToastDescription(description),
          ...props,
        });
      },
      success: ({ title, description, ...props }: ToastProps) => {
        sonnerToast.success(title || "", { 
          description: sanitizeToastDescription(description),
          ...props, 
        });
      },
      error: ({ title, description, ...props }: ToastProps) => {
        sonnerToast.error(title || "", {
          description: sanitizeToastDescription(description),
          ...props,
        });
      },
      warning: ({ title, description, ...props }: ToastProps) => {
        sonnerToast.warning(title || "", {
          description: sanitizeToastDescription(description),
          ...props,
        });
      },
      info: ({ title, description, ...props }: ToastProps) => {
        sonnerToast.info(title || "", {
          description: sanitizeToastDescription(description),
          ...props,
        });
      },
      message: (message: string) => {
        sonnerToast(message);
      },
    }),
    []
  );
  
  return toast;
};

// Default export
export default useToast;
