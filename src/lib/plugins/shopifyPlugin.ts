
import { registerPlugin } from "./pluginRegistry";
import type { Strategy } from "@/types/strategy";
import { supabase } from "@/integrations/supabase/client";

registerPlugin("shopify", {
  onStrategyLaunch: async (strategy: Strategy) => {
    console.log("[Shopify] Creating product for strategy:", strategy.title);
    
    await supabase.functions.invoke('shopify-products', {
      body: {
        title: strategy.title,
        description: strategy.description
      }
    });
  }
});
