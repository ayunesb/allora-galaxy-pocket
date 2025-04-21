
import { supabase } from "@/integrations/supabase/client";

type NotificationEvent = {
  tenant_id: string;
  event_type: string;
  description?: string | null;
};

export async function logNotification({
  tenant_id,
  event_type,
  description
}: NotificationEvent) {
  try {
    const { error } = await supabase
      .from("notifications")
      .insert({
        tenant_id,
        event_type,
        description,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error("[LogNotify] Error logging notification:", error.message);
      throw error;
    }
  } catch (error) {
    console.error("[LogNotify] Failed to log notification:", error);
    throw error;
  }
}
