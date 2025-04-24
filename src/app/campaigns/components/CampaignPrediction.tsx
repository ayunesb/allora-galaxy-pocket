
import React, { useState } from "react";
import { Campaign } from "@/types/campaign";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertTriangle, TrendingUp, BarChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface CampaignPredictionProps {
  campaign: Campaign;
}

export function CampaignPrediction({ campaign }: CampaignPredictionProps) {
  const [prediction, setPrediction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { tenant } = useTenant();

  const generatePrediction = async () => {
    if (!campaign.id || !tenant?.id) {
      toast.error("Missing campaign or tenant information");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("predict-campaign-performance", {
        body: { 
          campaign_id: campaign.id,
          tenant_id: tenant.id
        }
      });

      if (error) throw error;
      
      // Format the analysis text for display
      const formattedAnalysis = data.analysis
        .replace(/Performance prediction:/i, '<strong>Performance prediction:</strong>')
        .replace(/Optimization recommendations:/i, '<strong>Optimization recommendations:</strong>')
        .replace(/Risk factors:/i, '<strong>Risk factors:</strong>')
        .replace(/Expected ROI range:/i, '<strong>Expected ROI range:</strong>');
      
      setPrediction({
        ...data,
        formattedAnalysis
      });
      
      toast.success("AI prediction generated successfully");
    } catch (error) {
      console.error("Error generating prediction:", error);
      toast.error("Failed to generate campaign prediction");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Campaign Prediction</CardTitle>
        <Sparkles className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : prediction ? (
          <div className="space-y-3">
            <div dangerouslySetInnerHTML={{ __html: prediction.formattedAnalysis }} 
                 className="prose prose-sm max-w-none" />
            
            <div className="flex items-center text-xs text-muted-foreground pt-2">
              <BarChart className="h-3 w-3 mr-1" /> 
              Generated on {new Date(prediction.created_at).toLocaleDateString()}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              No prediction available. Generate an AI-powered performance forecast for this campaign.
            </p>
            <Button onClick={generatePrediction} disabled={isLoading}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Prediction
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
