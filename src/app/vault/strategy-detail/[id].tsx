import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Strategy } from "@/types/strategy";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import FeedbackTimeline from "./FeedbackTimeline";

export default function StrategyDetail() {
  const { id } = useParams();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchStrategy() {
      setIsLoading(true);
      try {
        setTimeout(() => {
          const mockStrategy: Strategy = {
            id: id || "1",
            title: "Double Activation in 30 Days",
            description: "This strategy focuses on increasing user activation through targeted engagement campaigns and personalized onboarding flows, leading to higher retention rates.",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            tenant_id: "tenant-001"
          };
          
          setStrategy(mockStrategy);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        toast({
          title: "Error loading strategy",
          description: "Could not load strategy details",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    }
    
    fetchStrategy();
  }, [id, toast]);

  const handleRemix = () => {
    toast({
      title: "Remixing strategy",
      description: "Creating a new version to customize"
    });
  };

  const handleLaunch = () => {
    toast({
      title: "Launching strategy",
      description: "Preparing to launch this strategy"
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-gray-200 rounded-md w-3/4" />
              <div className="h-4 bg-gray-200 rounded-md w-1/4" />
              <div className="h-24 bg-gray-200 rounded-md w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Strategy not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <h2 className="text-2xl font-bold">{strategy.title}</h2>
          <p className="text-sm text-muted-foreground">
            Created {strategy.created_at && format(new Date(strategy.created_at), 'PPP')}
          </p>
        </CardHeader>
        <CardContent>
          <p>{strategy.description}</p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={handleLaunch} variant="default">
            Launch Again
          </Button>
          <Button onClick={handleRemix} variant="secondary">
            Remix
          </Button>
        </CardFooter>
      </Card>
      
      <FeedbackTimeline strategyTitle={strategy.title} />
    </div>
  );
}
