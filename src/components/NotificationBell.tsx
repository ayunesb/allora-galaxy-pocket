
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";

export function NotificationBell() {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  
  // Fetch notifications
  useEffect(() => {
    if (!tenant?.id) return;
    
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('Error fetching notifications:', error);
      } else {
        setNotifications(data || []);
        setUnreadCount(data?.length || 0);
      }
    };
    
    fetchNotifications();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('notification_updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `tenant_id=eq.${tenant.id}`
      }, (payload) => {
        // Add the new notification to state
        const newNotification = payload.new;
        setNotifications(prev => [newNotification, ...prev].slice(0, 5));
        setUnreadCount(count => count + 1);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenant?.id]);
  
  // Mark notifications as read
  const markAsRead = async () => {
    if (!tenant?.id || notifications.length === 0) return;
    
    const notificationIds = notifications.map(n => n.id);
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', notificationIds);
    
    if (error) {
      console.error('Error marking notifications as read:', error);
    } else {
      setUnreadCount(0);
    }
  };
  
  const handleViewAll = () => {
    navigate('/notifications');
    setOpen(false);
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAsRead}
              className="text-xs h-7"
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length > 0 ? (
            <div className="py-2">
              {notifications.map(notification => (
                <Card key={notification.id} className="mx-2 my-1 cursor-pointer hover:bg-muted/50">
                  <div className="p-3">
                    <div className="text-sm font-medium">{notification.event_type}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {notification.description || 'No description'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No new notifications
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t text-center">
          <Button variant="ghost" size="sm" onClick={handleViewAll}>
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
