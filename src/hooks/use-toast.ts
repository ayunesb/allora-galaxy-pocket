
import { toast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
  [key: string]: any;
};

export function useToast() {
  return {
    toast: (props: ToastProps | string) => {
      if (typeof props === "string") {
        return toast(props);
      }
      
      const { title, description, variant, ...rest } = props;
      
      if (variant === "destructive") {
        return toast.error(title || "", {
          description: description || undefined,
          ...rest
        });
      }
      
      return toast(title || "", {
        description: description || undefined,
        ...rest
      });
    },
    success: (props: ToastProps | string) => {
      if (typeof props === "string") {
        return toast.success(props);
      }
      const { title, description, ...rest } = props;
      return toast.success(title || "", {
        description: description || undefined,
        ...rest
      });
    },
    error: (props: ToastProps | string) => {
      if (typeof props === "string") {
        return toast.error(props);
      }
      const { title, description, ...rest } = props;
      return toast.error(title || "", {
        description: description || undefined,
        ...rest
      });
    },
    warning: (props: ToastProps | string) => {
      if (typeof props === "string") {
        return toast.warning(props);
      }
      const { title, description, ...rest } = props;
      return toast.warning(title || "", {
        description: description || undefined,
        ...rest
      });
    },
    info: (props: ToastProps | string) => {
      if (typeof props === "string") {
        return toast.info(props);
      }
      const { title, description, ...rest } = props;
      return toast.info(title || "", {
        description: description || undefined,
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
