
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";
import { toast } from "sonner";
import { useAuth } from "./useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface NotificationInput {
  event_type: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
  link?: string;
}

export function useNotifications() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const sendNotification = async (notification: NotificationInput) => {
    if (!tenant?.id || !user?.id || isProcessing) return false;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          tenant_id: tenant.id,
          user_id: user.id,
          event_type: notification.event_type,
          description: notification.description,
          priority: notification.priority || 'medium',
          link: notification.link,
          read: false
        });
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      return true;
    } catch (error) {
      console.error("Error sending notification:", error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user?.id || isProcessing) return false;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id || isProcessing) return false;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      return true;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    notifications,
    isLoading,
    sendNotification,
    markAsRead,
    markAllAsRead,
    unreadCount: notifications?.filter(n => !n.read)?.length || 0
  };
}
