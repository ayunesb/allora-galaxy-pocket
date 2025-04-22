
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MemoryScoreIndicatorProps {
  score: number;
  lastUpdate?: string;
  className?: string;
}

export function MemoryScoreIndicator({ score, lastUpdate, className }: MemoryScoreIndicatorProps) {
  const formattedDate = lastUpdate ? new Date(lastUpdate).toLocaleDateString() : 'N/A';
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center">
        <div className="text-sm font-medium">Memory Score:</div>
        <div className="ml-2 text-lg font-bold">{score}</div>
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-4 w-4 ml-1 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Memory Score: how well this agent adapts to your business</p>
            <p className="text-xs text-muted-foreground mt-1">Last updated: {formattedDate}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div 
        className="w-24 h-2 bg-secondary rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div 
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
