
import { Button } from "@/components/ui/button";

interface LaunchButtonProps {
  onLaunch: () => void;
  approved: boolean;
}

export function LaunchButton({ onLaunch, approved }: LaunchButtonProps) {
  return (
    <div className="space-y-4">
      <Button 
        onClick={onLaunch} 
        disabled={approved}
        className="w-full"
      >
        ✅ Approve + Launch This Product
      </Button>

      {approved && (
        <p className="text-sm text-green-600 text-center">
          AI launched product across all channels and connected fulfillment 🚀
        </p>
      )}
    </div>
  );
}
