
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { StrategyViewer } from "@/components/StrategyViewer";
import { StrategyApprovalFlow } from "@/components/StrategyApprovalFlow";
import { getPluginHooks } from "@/lib/plugins/pluginRegistry";
import type { Strategy } from "@/types/strategy";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function LaunchPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showApproved, setShowApproved] = useState(false);

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

  const handleApproveComplete = () => {
    toast({
      title: "Strategy Launched",
      description: "Your strategy has been approved and is now live"
    });
    
    setShowApproved(true);
    
    // Give user time to see the approval confirmation
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['pending-strategy'] });
      setShowApproved(false);
    }, 3000);
  };

  const handleDeclineComplete = () => {
    toast({
      title: "Strategy Declined",
      description: "The strategy has been marked as declined"
    });
    
    queryClient.invalidateQueries({ queryKey: ['pending-strategy'] });
  };

  const refreshPendingStrategies = () => {
    queryClient.invalidateQueries({ queryKey: ['pending-strategy'] });
  };

  if (showApproved) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert className="max-w-3xl mx-auto bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Strategy Approved Successfully</AlertTitle>
          <AlertDescription>
            The strategy has been approved and is now ready for execution. 
            You'll be redirected to the next pending strategy soon.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl">No pending strategies</CardTitle>
            <CardDescription>
              There are no strategies currently waiting for your approval
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button 
              variant="outline" 
              onClick={refreshPendingStrategies}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Check for new strategies
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Launch Strategy</h1>
      
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <StrategyViewer 
            strategy={strategy}
            onApprove={() => {}}
          />
          <div className="mt-4">
            <StrategyApprovalFlow
              strategyId={strategy.id}
              onApproved={handleApproveComplete}
              onDeclined={handleDeclineComplete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
