
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <LoadingSpinner size={40} label="Loading plugins..." />
    </div>
  );
}
