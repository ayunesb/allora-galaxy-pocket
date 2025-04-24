
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, ArrowRight, Sparkles, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useCampaignIntegration } from "@/hooks/useCampaignIntegration";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import type { Strategy } from "@/types/strategy";

interface StrategySectionProps {
  strategies?: Strategy[];
}

export function StrategySection({ strategies }: StrategySectionProps) {
  const { convertStrategyToCampaign, isLoading } = useCampaignIntegration();
  const [creatingCampaignId, setCreatingCampaignId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleConvert = async (strategy: Strategy) => {
    setCreatingCampaignId(strategy.id);
    try {
      const result = await convertStrategyToCampaign(strategy);
      
      if (result) {
        // Invalidate relevant queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        queryClient.invalidateQueries({ queryKey: ['kpi-metrics'] });
        
        toast({
          title: "Campaign created successfully",
          description: "View it in the Campaign Center",
          variant: "default",
        });
      }
    } finally {
      setCreatingCampaignId(null);
    }
  };
  
  const handleExecuteCampaign = async (strategy: Strategy) => {
    // Create the campaign if it doesn't exist
    const result = await convertStrategyToCampaign(strategy);
    
    if (result) {
      // Forward to campaign execution page
      toast({
        title: "Campaign ready for execution",
        description: "You'll be redirected to the campaign execution center",
      });
      
      // In a real implementation, you'd navigate to the campaign execution page
      // For now, we'll invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['kpi-metrics'] });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Strategy Vault</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link to="/strategy">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {!strategies || strategies.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No strategies found
          </div>
        ) : (
          <div className="space-y-4">
            {strategies.map((strategy) => (
              <div key={strategy.id} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{strategy.title}</h3>
                  <Badge variant={strategy.status === 'approved' ? "success" : "outline"}>
                    {strategy.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {strategy.description}
                </p>
                
                <div className="mt-3 flex justify-end gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleExecuteCampaign(strategy)}
                    disabled={isLoading || strategy.status !== 'approved'}
                  >
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Execute
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleConvert(strategy)}
                    disabled={isLoading || strategy.status !== 'approved' || creatingCampaignId === strategy.id}
                  >
                    {creatingCampaignId === strategy.id ? (
                      <>Creating...</>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Create Campaign
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Campaign execution status indicators could be added here */}
                {strategy.status === 'approved' && (
                  <div className="mt-2 pt-2 border-t border-dashed flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {new Date(strategy.created_at || '').toLocaleDateString()}
                    </span>
                    <Link to={`/strategy/${strategy.id}`} className="text-xs text-blue-600 hover:underline">
                      View Details
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
