
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useTenant } from "@/hooks/useTenant";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { Loader2 } from "lucide-react";
import { WeeklySummary } from "@/types/decisions";

export default function WeeklySummaryFeed() {
  const [summaries, setSummaries] = useState<WeeklySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { tenant } = useTenant();
  const { toast } = useToast();

  const fetchSummaries = async () => {
    if (!tenant?.id) return;
    
    const { data, error } = await supabase
      .rpc('get_latest_weekly_summaries', { 
        tenant_id_param: tenant.id,
        limit_param: 10
      });

    if (error) {
      toast({
        title: "Error fetching summaries",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Cast the metadata to ensure it has the right properties
    const formattedSummaries: WeeklySummary[] = (data || []).map(item => ({
      ...item,
      metadata: typeof item.metadata === 'string' 
        ? { total_decisions: 0, ai_approval_rate: 0 } 
        : {
            total_decisions: item.metadata?.total_decisions || 0,
            ai_approval_rate: item.metadata?.ai_approval_rate || 0
          }
    }));

    setSummaries(formattedSummaries);
    setIsLoading(false);
  };

  const generateNewSummary = async () => {
    if (!tenant?.id || isGenerating) return;
    
    setIsGenerating(true);
    try {
      const { error } = await supabase.functions.invoke('generate-weekly-summary', {
        body: { tenantId: tenant.id }
      });

      if (error) throw error;

      toast({
        title: "Summary Generated",
        description: "New weekly summary has been created.",
      });

      fetchSummaries();
    } catch (error: any) {
      toast({
        title: "Error generating summary",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, [tenant?.id]);

  if (isLoading) {
    return <div>Loading summaries...</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Weekly AI Decision Summaries</h1>
        <Button 
          onClick={generateNewSummary}
          disabled={isGenerating}
        >
          {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate New Summary
        </Button>
      </div>

      <div className="space-y-6">
        {summaries.map((summary) => (
          <Card key={summary.id} className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium">
                  Week of {format(new Date(summary.week_start), 'MMMM d, yyyy')}
                </h4>
                <div className="text-sm text-muted-foreground">
                  {summary.metadata.total_decisions} decisions · {summary.metadata.ai_approval_rate}% AI approval rate
                </div>
              </div>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <Markdown content={summary.summary} />
            </CardContent>
          </Card>
        ))}
        
        {summaries.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No summaries generated yet. Click the button above to create your first summary.
          </div>
        )}
      </div>
    </div>
  );
}
