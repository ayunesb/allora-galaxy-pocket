
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";
import { useToast } from "./use-toast";

interface Notification {
  id: string;
  description?: string;
  event_type: string;
  tenant_id?: string;
  updated_at?: string;
  created_at?: string;
  is_read?: boolean;
}

export function useNotifications() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false })
          .limit(100);
          
        if (error) throw error;
        
        // Break the recursion by using unknown cast
        const safeData = data as unknown;
        return (safeData as Notification[]) || [];
        
      } catch (err) {
        console.error('Error fetching notifications:', err);
        return [];
      }
    },
    enabled: !!tenant?.id
  });
  
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!tenant?.id) return false;
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('tenant_id', tenant.id);
        
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', tenant?.id] });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
    }
  });
  
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!tenant?.id) return false;
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('tenant_id', tenant.id)
        .eq('is_read', false);
        
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', tenant?.id] });
      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
    },
    onError: (error) => {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive"
      });
    }
  });
  
  const unreadCount = notifications?.filter(n => !n.is_read)?.length || 0;
  
  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
}
