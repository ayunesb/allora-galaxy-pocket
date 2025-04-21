
import { registerPlugin } from "./pluginRegistry";
import type { Strategy } from "@/types/strategy";

registerPlugin("twilio", {
  onStrategyLaunch: async (strategy: Strategy) => {
    console.log("[Twilio] Sending notification for strategy:", strategy.title);
    // Future: Send SMS via Twilio API
  }
});
