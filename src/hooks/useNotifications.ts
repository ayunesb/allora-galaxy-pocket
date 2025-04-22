
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useWebhookAlert } from "@/hooks/useWebhookAlert";
import { logNotification } from "@/lib/notifications/logNotification";

interface SendNotificationParams {
  event_type: string;
  description: string;
  send_webhook?: boolean;
}

export function useNotifications() {
  const { tenant } = useTenant();
  const { sendAlert } = useWebhookAlert();
  
  const sendNotification = useMutation({
    mutationFn: async ({ event_type, description, send_webhook = false }: SendNotificationParams) => {
      if (!tenant?.id) return;
      
      // Log to notifications table
      await logNotification({
        tenant_id: tenant.id,
        event_type,
        description
      });
      
      // Send webhook alert if requested
      if (send_webhook) {
        await sendAlert({
          message: description,
          channel: "slack" // Default to Slack
        });
      }
      
      return { success: true };
    }
  });
  
  return {
    sendNotification: sendNotification.mutate,
    isSending: sendNotification.isPending
  };
}
