
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({ message = "Loading..." }: LoadingStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-2 space-y-2">
      <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};
