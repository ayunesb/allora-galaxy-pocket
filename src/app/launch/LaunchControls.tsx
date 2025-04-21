
import { Button } from "@/components/ui/button";
import { Check, AlertCircle } from "lucide-react";

interface LaunchControlsProps {
  onApprove: () => void;
  onRequestChanges: () => void;
}

export default function LaunchControls({ onApprove, onRequestChanges }: LaunchControlsProps) {
  return (
    <div className="flex gap-4 justify-end">
      <Button variant="secondary" onClick={onRequestChanges}>
        <AlertCircle className="mr-2 h-4 w-4" />
        Request Changes
      </Button>
      <Button onClick={onApprove}>
        <Check className="mr-2 h-4 w-4" />
        Approve & Launch
      </Button>
    </div>
  );
}
