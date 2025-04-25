
import { toast } from "sonner";
import type { ToastProps } from "@/components/ui/toast";

export function useToast() {
  return {
    toast: (props: ToastProps) => {
      const { title, description, variant = "default", duration = 5000 } = props;
      
      switch (variant) {
        case "success":
          toast.success(title, { description, duration });
          break;
        case "destructive":
          toast.error(title, { description, duration });
          break;
        case "warning":
          toast.warning(title, { description, duration });
          break;
        default:
          toast(title, { description, duration });
      }
    }
  };
}

export { toast };
