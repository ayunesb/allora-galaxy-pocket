
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  onRefresh: () => void;
}

export const ErrorState = ({ error, onRetry, onRefresh }: ErrorStateProps) => {
  return (
    <div className="space-y-3 px-2">
      <div className="text-red-500 py-2 px-2 text-sm flex items-center">
        <AlertCircle className="h-4 w-4 mr-1" />
        {error}
      </div>
      <Button
        size="sm"
        variant="outline"
        className="w-full mb-2"
        onClick={onRetry}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Retry
      </Button>
      <Button
        size="sm"
        variant="secondary"
        className="w-full"
        onClick={onRefresh}
      >
        Refresh Page
      </Button>
    </div>
  );
};
