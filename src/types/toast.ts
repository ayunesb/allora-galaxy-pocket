
export type ToastFunction = (options: {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}) => void;
