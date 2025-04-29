
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Loader2, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLaunchReadiness } from '@/hooks/useLaunchReadiness';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function LaunchReadinessButton() {
  const { healthScore, status, isRunning, runChecks } = useLaunchReadiness(true);

  // Run checks automatically on mount
  useEffect(() => {
    if (!isRunning && healthScore === 0) {
      runChecks();
    }
  }, [isRunning, healthScore, runChecks]);

  const getStatusColor = () => {
    if (status === "complete" && healthScore >= 90) {
      return 'bg-green-500 text-white';
    } else if (status === "complete" && healthScore >= 70) {
      return 'bg-amber-500 text-white';
    } else if (status === "error" || (status === "complete" && healthScore < 70)) {
      return 'bg-red-500 text-white';
    } else {
      return 'bg-gray-500 text-white';
    }
  };

  const getTooltipContent = () => {
    if (isRunning) {
      return "Running launch readiness checks...";
    } else if (status === "complete") {
      if (healthScore >= 90) {
        return "System is ready for production launch";
      } else if (healthScore >= 70) {
        return "Launch readiness requires some attention";
      } else {
        return "Critical issues detected - not ready for launch";
      }
    } else if (status === "error") {
      return "Error checking launch readiness";
    } else {
      return "Launch readiness status unknown";
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to="/launch-readiness">
            <Button variant="outline" className="relative flex items-center gap-2">
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              <span>Launch Readiness</span>
              <Badge className={`absolute -top-2 -right-2 ${getStatusColor()}`}>
                {isRunning ? '...' : `${healthScore}%`}
              </Badge>
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            <span>{getTooltipContent()}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
