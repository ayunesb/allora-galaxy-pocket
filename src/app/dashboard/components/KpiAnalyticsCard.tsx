
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function KpiAnalyticsCard() {
  const navigate = useNavigate();
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-2">
          <BarChart2 className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">KPI Analytics</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Track your business metrics and performance indicators
        </p>
        <Button
          variant="link"
          className="mt-2 h-auto p-0"
          onClick={() => navigate("/insights/kpis")}
        >
          View KPI Dashboard →
        </Button>
      </CardContent>
    </Card>
  );
}
