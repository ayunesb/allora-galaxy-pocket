
import React, { useState } from "react";
import { format } from "date-fns";
import { Bell, ChartLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useQuery } from "@tanstack/react-query";
import type { Notification } from "@/types/notification";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import GrowthPanel from "./GrowthPanel";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { tenant } = useTenant();

  useQuery({
    queryKey: ["notifications", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      setIsLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        return [];
      } else {
        setNotifications(data || []);
      }
      setIsLoading(false);
      return data || [];
    },
    enabled: !!tenant?.id
  });

  return (
    <ErrorBoundary>
      <div className="container mx-auto py-8">
        <Tabs defaultValue="all">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="growth">Growth</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-16 bg-muted rounded-lg" />
                        </div>
                      ))}
                    </div>
                  ) : notifications.length > 0 ? (
                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-lg border ${
                            notification.is_read ? "bg-background" : "bg-muted"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className="font-medium text-sm">
                                {notification.event_type}
                              </p>
                              {notification.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.description}
                                </p>
                              )}
                            </div>
                            <time className="text-xs text-muted-foreground">
                              {format(new Date(notification.created_at), "PPp")}
                            </time>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      No notifications yet
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="growth">
            <GrowthPanel />
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}
