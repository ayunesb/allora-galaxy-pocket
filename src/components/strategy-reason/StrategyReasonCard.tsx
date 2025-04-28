
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Strategy } from "@/types/strategy";
import { Lightbulb } from "lucide-react";

interface StrategyReasonCardProps {
  strategy: Strategy;
}

export function StrategyReasonCard({ strategy }: StrategyReasonCardProps) {
  if (!strategy.reason_for_recommendation) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        <CardTitle className="text-lg">Why This Strategy?</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-700">{strategy.reason_for_recommendation}</p>
      </CardContent>
    </Card>
  );
}
