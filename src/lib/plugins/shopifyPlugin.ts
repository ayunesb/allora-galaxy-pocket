
import { registerPlugin } from "./pluginRegistry";
import type { Strategy } from "@/types/strategy";

registerPlugin("shopify", {
  onStrategyLaunch: async (strategy: Strategy) => {
    console.log("[Shopify] Creating product for strategy:", strategy.title);
    // Future: Create Shopify product via API
  }
});
