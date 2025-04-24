
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { RefreshCw, ThumbsUp, ThumbsDown } from "lucide-react";

interface StrategyActionsProps {
  onApprove: () => void;
  onDecline: () => void;
  onRegenerate: () => void;
}

export function StrategyActions({ onApprove, onDecline, onRegenerate }: StrategyActionsProps) {
  return (
    <CardFooter className="flex justify-between">
      <div className="flex gap-2">
        <Button onClick={onApprove} variant="default">
          <ThumbsUp className="h-4 w-4 mr-2" />
          Approve
        </Button>
        <Button onClick={onDecline} variant="outline">
          <ThumbsDown className="h-4 w-4 mr-2" />
          Decline
        </Button>
      </div>
      <Button onClick={onRegenerate} variant="secondary">
        <RefreshCw className="h-4 w-4 mr-2" />
        Regenerate
      </Button>
    </CardFooter>
  );
}
