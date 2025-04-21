
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTenant } from "@/hooks/useTenant";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BillingStats {
  usage: number;
  limit: number;
  plan: "Free" | "Pro" | "Enterprise";
}

export default function BillingPanel() {
  const { tenant } = useTenant();
  const { data: stats } = useQuery({
    queryKey: ["billing", tenant?.id],
    queryFn: async (): Promise<BillingStats> => {
      if (!tenant?.id) {
        return { usage: 0, limit: 100, plan: "Free" };
      }

      const { data } = await supabase
        .from("tenant_profiles")
        .select("usage_credits")
        .eq("id", tenant.id)
        .maybeSingle();

      return {
        usage: 100 - (data?.usage_credits || 0),
        limit: 100,
        plan: "Free"
      };
    }
  });

  const usagePercent = ((stats?.usage || 0) / (stats?.limit || 1)) * 100;

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">💳 Billing & Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Current Plan:</span>
          <span className="font-medium">{stats?.plan || "Loading..."}</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Strategy Credits Used:</span>
            <span className="font-medium">{stats?.usage || 0} / {stats?.limit || 0}</span>
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
