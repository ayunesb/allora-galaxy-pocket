
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface KpiEmptyStateProps {
  title?: string;
  description?: string;
  showAddButton?: boolean;
}

export default function KpiEmptyState({ 
  title = "No KPI Metrics Available", 
  description = "Your KPI metrics dashboard is ready, but there's no data yet.", 
  showAddButton = true 
}: KpiEmptyStateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📉 {title}</CardTitle>
      </CardHeader>
      <CardContent className="p-8 text-center">
        <p className="text-lg text-muted-foreground mb-4">
          {description}
        </p>
        <p className="text-sm text-muted-foreground">
          Once your AI agents begin executing tasks and campaigns, 
          KPI metrics will start appearing here.
        </p>
        {showAddButton && (
          <div className="mt-6">
            <Button as={Link} to="/kpi/add" className="flex items-center">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add KPI Manually
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
