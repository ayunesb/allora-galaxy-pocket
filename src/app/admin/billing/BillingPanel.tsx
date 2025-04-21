
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface BillingStats {
  usage: number;
  limit: number;
  plan: "Free" | "Pro" | "Enterprise";
}

export default function BillingPanel() {
  const [stats] = useState<BillingStats>({
    usage: 42,
    limit: 100,
    plan: "Free"
  });

  const usagePercent = (stats.usage / stats.limit) * 100;

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">💳 Billing & Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Current Plan:</span>
          <span className="font-medium">{stats.plan}</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Strategy Credits Used:</span>
            <span className="font-medium">{stats.usage} / {stats.limit}</span>
          </div>
          <Progress value={usagePercent} className="h-2" />
        </div>

        <Button className="w-full bg-green-600 hover:bg-green-700">
          Upgrade Plan
        </Button>
      </CardContent>
    </Card>
  );
}
