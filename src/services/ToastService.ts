
import { toast } from "@/hooks/use-toast";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export class ToastService {
  static success(options: ToastOptions) {
    toast({
      title: options.title,
      description: options.description,
      variant: 'default',
      duration: options.duration || 3000
    });
  }

  static error(options: ToastOptions) {
    toast({
      title: options.title,
      description: options.description,
      variant: 'destructive',
      duration: options.duration || 5000
    });
  }

  static info(options: ToastOptions) {
    toast({
      title: options.title,
      description: options.description,
      variant: 'default',
      duration: options.duration || 4000
    });
  }
}
