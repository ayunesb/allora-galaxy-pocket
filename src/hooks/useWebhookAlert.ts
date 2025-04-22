
import { supabase } from "@/integrations/supabase/client";

type Channel = "slack" | "discord";

interface AlertOptions {
  message: string;
  channel?: Channel;
}

export function useWebhookAlert() {
  const sendAlert = async ({ message, channel = "slack" }: AlertOptions) => {
    try {
      const { error } = await supabase.functions.invoke("send-webhook-alert", {
        body: { message, channel }
      });

      if (error) throw error;
    } catch (err) {
      console.error("[Webhook Alert Error]", err);
    }
  };

  return { sendAlert };
}
