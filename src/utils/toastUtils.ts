
import { toast } from "@/components/ui/use-toast";

export interface ToastOptions {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

/**
 * Helper function to show toast notifications
 */
export const showToast = ({
  title,
  description,
  variant = 'default',
  duration = 3000
}: ToastOptions) => {
  toast({
    title,
    description,
    variant,
    duration
  });
};
