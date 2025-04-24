
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface SecurityEventsCardProps {
  eventsCount: number;
  lastEventDate?: string;
}

export function SecurityEventsCard({ eventsCount, lastEventDate }: SecurityEventsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Security Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-2">
          <div className="text-3xl font-bold">{eventsCount}</div>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        
        {lastEventDate && (
          <div className="text-xs text-muted-foreground">
            Last security event: {lastEventDate}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
