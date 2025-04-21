
import { registerPlugin } from "./pluginRegistry";
import type { Strategy } from "@/types/strategy";

registerPlugin("stripe", {
  onStrategyLaunch: async (strategy: Strategy) => {
    console.log("[Stripe] Metering usage for strategy:", strategy.title);
    // Future: Integrate with Stripe metering API
  }
});
