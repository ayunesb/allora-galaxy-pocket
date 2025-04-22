
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useQuery } from "@tanstack/react-query";
import { Bell, ChartLineUp, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GrowthNotification {
  id: string;
  event_type: string;
  description: string;
  milestone_type?: string;
  metric_value?: number;
  growth_recommendation?: string;
  created_at: string;
}

export default function GrowthPanel() {
  const { tenant } = useTenant();

  const { data: notifications } = useQuery({
    queryKey: ["growth-notifications", tenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("tenant_id", tenant?.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as GrowthNotification[];
    },
    enabled: !!tenant?.id
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "milestone":
        return <Target className="h-4 w-4" />;
      case "growth":
        return <ChartLineUp className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLineUp className="h-5 w-5" />
            Growth Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {notifications?.length ? (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getNotificationIcon(notification.event_type)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {notification.milestone_type || notification.event_type}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.description}
                        </p>
                        {notification.growth_recommendation && (
                          <p className="text-sm text-primary mt-2">
                            💡 {notification.growth_recommendation}
                          </p>
                        )}
                        {notification.metric_value !== null && (
                          <p className="text-sm font-medium mt-2">
                            Value: {notification.metric_value}
                          </p>
                        )}
                      </div>
                      <time className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </time>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">
                No growth notifications yet
              </p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
