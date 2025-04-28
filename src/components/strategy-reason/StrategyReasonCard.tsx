
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Strategy } from "@/types/strategy";
import { Lightbulb } from "lucide-react";

interface StrategyReasonCardProps {
  strategy: Strategy;
  className?: string;
}

export function StrategyReasonCard({ strategy, className }: StrategyReasonCardProps) {
  // If no reason is provided, don't render the card
  if (!strategy.reason_for_recommendation) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Why this strategy is recommended
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          {strategy.reason_for_recommendation}
        </div>
      </CardContent>
    </Card>
  );
}

export default StrategyReasonCard;
