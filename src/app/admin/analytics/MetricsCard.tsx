
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface MetricsCardProps {
  title: string;
  value: string | number;
  trend?: string;
  change?: string;
  percentage?: string;
  description?: string;
}

export function MetricsCard({ title, value, trend, change, percentage, description }: MetricsCardProps) {
  // Convert value to string to ensure proper display
  const displayValue = typeof value === 'number' ? value.toString() : value;
  
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="text-2xl font-bold mt-1">{displayValue}</div>
        
        {trend && (percentage || change) && (
          <div className="flex items-center mt-2">
            {trend === "up" ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-xs ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
              {percentage || change}
            </span>
          </div>
        )}

        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
