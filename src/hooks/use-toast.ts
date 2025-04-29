
import { toast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string | React.ReactNode;
  variant?: "default" | "destructive";
  duration?: number;
  [key: string]: any;
};

// Helper function to ensure toast descriptions are valid
function ensureValidDescription(description: any): string | undefined {
  if (description === undefined || description === null) {
    return undefined;
  }
  
  if (typeof description === 'string') {
    return description;
  }
  
  if (React.isValidElement(description)) {
    return undefined; // Sonner supports React elements, so return as is
  }
  
  // For objects, try to stringify them
  try {
    return JSON.stringify(description);
  } catch (e) {
    return String(description);
  }
}

export function useToast() {
  return {
    toast: (props: ToastProps | string) => {
      if (typeof props === "string") {
        return toast(props);
      }
      
      const { title, description, variant, ...rest } = props;
      const safeDescription = ensureValidDescription(description);
      
      if (variant === "destructive") {
        return toast.error(title || "", {
          description: safeDescription,
          ...rest
        });
      }
      
      return toast(title || "", {
        description: safeDescription,
        ...rest
      });
    },
    success: (props: ToastProps | string) => {
      if (typeof props === "string") {
        return toast.success(props);
      }
      const { title, description, ...rest } = props;
      const safeDescription = ensureValidDescription(description);
      return toast.success(title || "", {
        description: safeDescription,
        ...rest
      });
    },
    error: (props: ToastProps | string) => {
      if (typeof props === "string") {
        return toast.error(props);
      }
      const { title, description, ...rest } = props;
      const safeDescription = ensureValidDescription(description);
      return toast.error(title || "", {
        description: safeDescription,
        ...rest
      });
    },
    warning: (props: ToastProps | string) => {
      if (typeof props === "string") {
        return toast.warning(props);
      }
      const { title, description, ...rest } = props;
      const safeDescription = ensureValidDescription(description);
      return toast.warning(title || "", {
        description: safeDescription,
        ...rest
      });
    },
    info: (props: ToastProps | string) => {
      if (typeof props === "string") {
        return toast.info(props);
      }
      const { title, description, ...rest } = props;
      const safeDescription = ensureValidDescription(description);
      return toast.info(title || "", {
        description: safeDescription,
        ...rest
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
      return toast.promise(promise, messages);
    }
  };
}
