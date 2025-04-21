
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface FeedbackLog {
  user_id: string;
  action: string;
  created_at: string;
  strategy_title: string;
}

export default function FeedbackTimeline({ strategyTitle }: { strategyTitle: string }) {
  const [logs, setLogs] = useState<FeedbackLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      setIsLoading(true);
      const { data } = await supabase
        .from("strategy_feedback")
        .select("user_id, action, created_at, strategy_title")
        .eq("strategy_title", strategyTitle)
        .order("created_at", { ascending: false });
        
      setLogs(data || []);
      setIsLoading(false);
    }
    fetchLogs();
  }, [strategyTitle]);

  if (isLoading) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>🕓 Feedback Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 animate-pulse">
            <div className="h-8 bg-gray-200 rounded" />
            <div className="h-8 bg-gray-200 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>🕓 Feedback Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {logs.map((log, i) => (
            <div 
              key={i} 
              className="flex justify-between items-center text-sm text-muted-foreground bg-muted rounded-md p-3"
            >
              <span className="truncate max-w-[100px]">{log.user_id}</span>
              <span>{log.action === "used" ? "✅ Used" : "❌ Dismissed"}</span>
              <span>{format(new Date(log.created_at), 'PPp')}</span>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-sm text-muted-foreground">No feedback logged yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
