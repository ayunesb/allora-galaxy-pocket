
import React from "react";
import { useToast } from "@/hooks/use-toast";
import StrategyPreview from "./StrategyPreview";
import LaunchControls from "./LaunchControls";
import { getPluginHooks } from "@/lib/plugins/pluginRegistry";

// Import plugins to register them
import "@/lib/plugins/stripePlugin";
import "@/lib/plugins/shopifyPlugin";
import "@/lib/plugins/twilioPlugin";

export default function LaunchPage() {
  const { toast } = useToast();
  
  const strategy = {
    title: "Automate Lead Follow-Up",
    summary: "Use AI agents to follow up with MQLs within 3 minutes using Twilio + ChatGPT + CRM sync."
  };

  const handleApprove = async () => {
    // Get all registered plugin hooks
    const hooks = getPluginHooks();

    // Execute onStrategyLaunch for each active plugin
    try {
      await Promise.all(
        Object.entries(hooks).map(([key, hook]) => 
          hook.onStrategyLaunch?.(strategy)
        )
      );

      toast({
        title: "Strategy Launched",
        description: "Your strategy has been approved and is now live"
      });
    } catch (error) {
      console.error("Error in plugin execution:", error);
      toast({
        title: "Launch Failed",
        description: "There was an error launching the strategy",
        variant: "destructive"
      });
    }
  };

  const handleRequestChanges = () => {
    toast({
      title: "Changes Requested",
      description: "AI will revise the strategy based on your feedback",
      variant: "destructive"
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Launch Strategy</h1>
      
      <div className="max-w-3xl mx-auto space-y-6">
        <StrategyPreview {...strategy} />
        <LaunchControls
          onApprove={handleApprove}
          onRequestChanges={handleRequestChanges}
        />
      </div>
    </div>
  );
}
