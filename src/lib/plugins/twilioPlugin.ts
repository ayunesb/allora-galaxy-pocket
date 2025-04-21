
import { registerPlugin } from "./pluginRegistry";
import type { Strategy } from "@/types/strategy";
import { supabase } from "@/integrations/supabase/client";

registerPlugin("twilio", {
  onStrategyLaunch: async (strategy: Strategy) => {
    console.log("[Twilio] Sending notification for strategy:", strategy.title);
    
    await supabase.functions.invoke('twilio-send-sms', {
      body: {
        to: "+1234567890", // This would come from tenant config
        message: `New strategy launched: ${strategy.title}`
      }
    });
  }
});
