
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ActionButtonsProps {
  onApprove: () => void;
  approved: boolean;
}

export function ActionButtons({ onApprove, approved }: ActionButtonsProps) {
  return (
    <div className="flex gap-4 items-center">
      <Button 
        onClick={onApprove} 
        disabled={approved}
        variant="default"
      >
        ✅ Approve & Execute
      </Button>
      
      <Button variant="outline">
        Edit Campaign
      </Button>
      
      <Button variant="ghost" size="icon">
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
}
