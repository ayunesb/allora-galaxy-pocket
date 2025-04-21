
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Strategy } from "@/types/strategy";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { format } from "date-fns";
import { useTenant } from "@/hooks/useTenant";
import { useToast } from "@/hooks/use-toast";

export default function StrategyDetail() {
  const { id } = useParams();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { tenant } = useTenant();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchStrategy() {
      if (!id) return;
      
      const { data, error } = await supabase
        .from("vault_strategies")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", tenant?.id)
        .maybeSingle();

      if (error) {
        toast({
          title: "Error loading strategy",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setStrategy(data);
      }
      setIsLoading(false);
    }
    
    fetchStrategy();
  }, [id, tenant?.id, toast]);

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
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4 animate-pulse">
                <div className="h-8 bg-gray-200 rounded-md w-3/4" />
                <div className="h-4 bg-gray-200 rounded-md w-1/4" />
                <div className="h-24 bg-gray-200 rounded-md w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Strategy not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <h2 className="text-2xl font-bold">{strategy.title}</h2>
          <p className="text-sm text-muted-foreground">
            Created {strategy.created_at && format(new Date(strategy.created_at), 'PPP')}
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-gray-800">{strategy.description}</p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={handleLaunch} className="bg-primary">
            Launch Again
          </Button>
          <Button onClick={handleRemix} variant="secondary">
            Remix
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
