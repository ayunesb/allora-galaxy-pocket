
import React from "react";
import { useToast } from "@/hooks/use-toast";
import StrategyPreview from "./StrategyPreview";
import LaunchControls from "./LaunchControls";

export default function LaunchPage() {
  const { toast } = useToast();
  
  const strategy = {
    title: "Automate Lead Follow-Up",
    summary: "Use AI agents to follow up with MQLs within 3 minutes using Twilio + ChatGPT + CRM sync."
  };

  const handleApprove = () => {
    toast({
      title: "Strategy Launched",
      description: "Your strategy has been approved and is now live",
    });
  };

  const handleRequestChanges = () => {
    toast({
      title: "Changes Requested",
      description: "AI will revise the strategy based on your feedback",
      variant: "destructive",
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
