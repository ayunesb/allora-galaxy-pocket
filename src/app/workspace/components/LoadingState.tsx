
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message: string;
}

export const LoadingState = ({ message }: LoadingStateProps) => {
  return (
    <div className="flex w-full items-center justify-center h-12 px-2">
      <Loader2 className="h-5 w-5 animate-spin mr-2" />
      <span>{message}</span>
    </div>
  );
};
