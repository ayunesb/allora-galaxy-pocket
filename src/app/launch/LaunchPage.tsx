
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { StrategyViewer } from "@/components/StrategyViewer";
import LaunchControls from "./LaunchControls";
import { getPluginHooks } from "@/lib/plugins/pluginRegistry";
import type { Strategy } from "@/types/strategy";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function LaunchPage() {
  const { toast } = useToast();

  const { data: strategy, isLoading } = useQuery({
    queryKey: ['pending-strategy'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as Strategy;
    }
  });

  const handleApprove = async () => {
    if (!strategy) return;
    
    // Get all registered plugin hooks
    const hooks = getPluginHooks();

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No pending strategies to review</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Launch Strategy</h1>
      
      <div className="max-w-3xl mx-auto space-y-6">
        <StrategyViewer 
          strategy={strategy}
          onApprove={handleApprove}
        />
      </div>
    </div>
  );
}
