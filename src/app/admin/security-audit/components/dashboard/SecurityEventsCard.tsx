
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

interface SecurityEventsCardProps {
  eventsCount: number;
  lastEventDate?: string;
}

export function SecurityEventsCard({ eventsCount, lastEventDate }: SecurityEventsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Security Events</CardTitle>
        <Lock className="h-5 w-5 text-violet-500" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{eventsCount}</div>
        <p className="text-sm text-muted-foreground mt-2">
          {eventsCount > 0 
            ? `Last event: ${lastEventDate}` 
            : 'No security events recorded'}
        </p>
      </CardContent>
    </Card>
  );
}
