
import { toast } from "sonner";
import { toast as hookToast } from "@/hooks/use-toast";

// This utility bridges the gap between different toast implementations
// in the application, providing a consistent API

/**
 * Shows a toast notification using the most appropriate implementation
 * based on context
 */
export function showToast(options: {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}) {
  const { title, description, variant, duration } = options;
  
  try {
    // Try to use sonner toast first (preferred)
    if (variant === 'destructive') {
      toast.error(title, { description });
    } else if (variant === 'success') {
      toast.success(title, { description });
    } else {
      toast(title, { description });
    }
  } catch (error) {
    // Fall back to shadcn toast if sonner fails
    hookToast({
      title,
      description,
      variant: variant === 'success' ? 'default' : variant,
      duration,
    });
  }
}

/**
 * Displays an error toast
 */
export function showErrorToast(title: string, description?: string) {
  showToast({
    title,
    description,
    variant: 'destructive'
  });
}

/**
 * Displays a success toast
 */
export function showSuccessToast(title: string, description?: string) {
  showToast({
    title,
    description,
    variant: 'success'
  });
}
