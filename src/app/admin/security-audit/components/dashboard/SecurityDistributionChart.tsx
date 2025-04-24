
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart } from "@/components/ui/charts";

interface SecurityScores {
  high: number;
  medium: number;
  low: number;
}

interface SecurityDistributionChartProps {
  securityScores: SecurityScores;
}

export function SecurityDistributionChart({ securityScores }: SecurityDistributionChartProps) {
  const chartData = {
    labels: ["High Security", "Medium Security", "Low Security"],
    datasets: [
      {
        label: "Tables by Security Level",
        data: [securityScores.high, securityScores.medium, securityScores.low],
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"]
      }
    ]
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Distribution</CardTitle>
        <CardDescription>Distribution of tables by security level</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <BarChart data={chartData} height={260} />
        </div>
      </CardContent>
    </Card>
  );
}
