
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export interface ApprovalMetricsCardProps {
  title: string;
  value: number;
  description: string;
}

export function ApprovalMetricsCard({ title, value, description }: ApprovalMetricsCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-1">{title}</h3>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
