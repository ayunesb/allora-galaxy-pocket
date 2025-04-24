
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useCampaignIntegration } from "@/hooks/useCampaignIntegration";
import type { Strategy } from "@/types/strategy";

interface StrategySectionProps {
  strategies?: Strategy[];
}

export function StrategySection({ strategies }: StrategySectionProps) {
  const { convertStrategyToCampaign, isLoading } = useCampaignIntegration();

  const handleConvert = async (strategy: Strategy) => {
    await convertStrategyToCampaign(strategy);
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
                
                <div className="mt-3 flex justify-end">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleConvert(strategy)}
                    disabled={isLoading || strategy.status !== 'approved'}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Campaign
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
