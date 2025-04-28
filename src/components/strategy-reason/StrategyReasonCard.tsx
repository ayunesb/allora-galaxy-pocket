
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import type { Strategy } from "@/types/strategy";

interface StrategyReasonCardProps {
  strategy: Strategy;
}

export function StrategyReasonCard({ strategy }: StrategyReasonCardProps) {
  // Safely handle when reason_for_recommendation might not exist
  const reasonText = strategy.reason_for_recommendation || "This strategy was recommended based on your business goals and market analysis.";

  return (
    <Card className="bg-muted/50">
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-2">Why This Strategy?</h3>
        <p className="text-sm text-muted-foreground">{reasonText}</p>
      </CardContent>
    </Card>
  );
}
