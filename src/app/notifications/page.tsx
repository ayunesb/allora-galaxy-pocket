
import React, { useState } from "react";
import { Bell, ChartLine, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationItem from "./NotificationItem";
import { GrowthPanel } from "./GrowthPanel";
import type { Notification } from "@/types/notification";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const { markAsRead, markAllAsRead, unreadCount } = useNotifications();
  
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        return [];
      }
      
      return data;
    },
    enabled: !!tenant?.id
  });
  
  const handleMarkAsRead = async (id: string) => {
    await markAsRead.mutateAsync(id);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };
  
  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync();
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const filterNotifications = (type: string | null) => {
    if (!type || type === "all") return notifications;
    return notifications.filter(n => n.event_type.toLowerCase().includes(type.toLowerCase()));
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto py-8">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Notifications</h1>
              {unreadCount > 0 && (
                <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                  {unreadCount} new
                </div>
              )}
            </div>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="growth">Growth</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Notifications
                </CardTitle>
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark all as read
                  </Button>
                )}
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
                      {filterNotifications(activeTab).map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No notifications</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        You're all caught up! Check back later for updates.
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  System Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-16 bg-muted rounded-lg" />
                        </div>
                      ))}
                    </div>
                  ) : filterNotifications('system').length > 0 ? (
                    <div className="space-y-4">
                      {filterNotifications('system').map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      No system notifications yet
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
