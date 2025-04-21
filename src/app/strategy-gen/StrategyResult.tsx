
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function StrategyResult({ industry, goal }: { 
  industry: string; 
  goal: string; 
}) {
  const { toast } = useToast();

  const handleSaveStrategy = async () => {
    const { error } = await supabase.from("vault_strategies").insert({
      title: "Generated Strategy",
      description: `Industry: ${industry}, Goal: ${goal}`,
    });

    if (error) {
      toast({
        title: "Error saving strategy",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Strategy saved successfully",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Strategy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">🧠 Based on your input:</p>
        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
          <li>Industry: {industry}</li>
          <li>Goal: {goal}</li>
        </ul>
        <div className="rounded-lg bg-green-50 p-4 mt-4">
          <p className="text-sm text-green-700 font-medium">
            Suggested Action: Launch a 3-email nudge campaign + follow-up with AI assistant to demo key benefits. Deploy within 3 days.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
