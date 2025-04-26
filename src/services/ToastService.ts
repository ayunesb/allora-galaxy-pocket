
import { toast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  [key: string]: any;
};

export const ToastService = {
  success: (props: ToastProps | string) => {
    if (typeof props === "string") {
      return toast.success(props);
    }
    const { title, description, ...rest } = props;
    return toast.success(title, {
      description,
      ...rest
    });
  },
  error: (props: ToastProps | string) => {
    if (typeof props === "string") {
      return toast.error(props);
    }
    const { title, description, ...rest } = props;
    return toast.error(title, {
      description,
      ...rest
    });
  },
  warning: (props: ToastProps | string) => {
    if (typeof props === "string") {
      return toast.warning(props);
    }
    const { title, description, ...rest } = props;
    return toast.warning(title, {
      description,
      ...rest
    });
  },
  info: (props: ToastProps | string) => {
    if (typeof props === "string") {
      return toast.info(props);
    }
    const { title, description, ...rest } = props;
    return toast.info(title, {
      description,
      ...rest
    });
  },
  toast: (props: ToastProps | string) => {
    if (typeof props === "string") {
      return toast(props);
    }
    
    const { title, description, variant, ...rest } = props;
    
    if (variant === "destructive") {
      return toast.error(title, {
        description,
        ...rest
      });
    }
    
    return toast(title, {
      description,
      ...rest
    });
  }
};
